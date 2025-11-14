import { query } from '../config/database.js'

/**
 * 성과 분석 리포트 생성 서비스
 * 키워드 분석 성과를 종합하여 리포트 생성
 */

/**
 * 전체 성과 리포트 생성
 * @param {Object} options - 리포트 옵션 { startDate, endDate, includeRecommendations }
 * @returns {Object} 종합 리포트 데이터
 */
export const generatePerformanceReport = async (options = {}) => {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 기본 30일
    endDate = new Date(),
    includeRecommendations = true,
  } = options

  try {
    // 1. 기간 내 전체 통계
    const overallStats = await getOverallStats(startDate, endDate)

    // 2. 황금 키워드 성과
    const goldenKeywordPerformance = await getGoldenKeywordPerformance(startDate, endDate)

    // 3. 카테고리별 성과
    const categoryPerformance = await getCategoryPerformance(startDate, endDate)

    // 4. 트렌드 분석
    const trendAnalysis = await getTrendAnalysis(startDate, endDate)

    // 5. 상위/하위 성과 키워드
    const topKeywords = await getTopKeywords(startDate, endDate, 10)
    const bottomKeywords = await getBottomKeywords(startDate, endDate, 10)

    // 6. 추천사항 생성
    let recommendations = null
    if (includeRecommendations) {
      recommendations = generateRecommendations({
        overallStats,
        goldenKeywordPerformance,
        categoryPerformance,
        trendAnalysis,
        topKeywords,
        bottomKeywords,
      })
    }

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
      },
      overallStats,
      goldenKeywordPerformance,
      categoryPerformance,
      trendAnalysis,
      topKeywords,
      bottomKeywords,
      recommendations,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Generate performance report error:', error)
    throw new Error('성과 리포트 생성 실패: ' + error.message)
  }
}

/**
 * 기간 내 전체 통계
 */
const getOverallStats = async (startDate, endDate) => {
  const result = await query(
    `SELECT
      COUNT(DISTINCT keyword_text) as total_unique_keywords,
      COUNT(*) as total_searches,
      AVG(search_volume) as avg_search_volume,
      AVG(kgr) as avg_kgr,
      AVG(kei) as avg_kei,
      AVG(cpc) as avg_cpc,
      AVG(difficulty) as avg_difficulty,
      MIN(kgr) as best_kgr,
      MAX(search_volume) as max_search_volume
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2`,
    [startDate, endDate]
  )

  return result.rows[0]
}

/**
 * 황금 키워드 성과 (KGR < 0.25)
 */
const getGoldenKeywordPerformance = async (startDate, endDate) => {
  const result = await query(
    `SELECT
      COUNT(*) as golden_keyword_count,
      AVG(search_volume) as avg_search_volume,
      AVG(cpc) as avg_cpc,
      AVG(difficulty) as avg_difficulty,
      SUM(search_volume) as total_potential_traffic
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
      AND kgr < 0.25`,
    [startDate, endDate]
  )

  // 황금 키워드 발견율 계산
  const totalCount = await query(
    `SELECT COUNT(*) as total FROM keyword_metrics WHERE created_at BETWEEN $1 AND $2`,
    [startDate, endDate]
  )

  const goldenCount = parseInt(result.rows[0].golden_keyword_count) || 0
  const total = parseInt(totalCount.rows[0].total) || 1

  return {
    ...result.rows[0],
    discovery_rate: ((goldenCount / total) * 100).toFixed(2),
  }
}

/**
 * 카테고리별 성과 (트렌드, 의도별)
 */
const getCategoryPerformance = async (startDate, endDate) => {
  // 트렌드별
  const trendStats = await query(
    `SELECT
      trend,
      COUNT(*) as count,
      AVG(kgr) as avg_kgr,
      AVG(search_volume) as avg_search_volume
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
      AND trend IS NOT NULL
    GROUP BY trend
    ORDER BY count DESC`,
    [startDate, endDate]
  )

  // 의도별
  const intentStats = await query(
    `SELECT
      intent,
      COUNT(*) as count,
      AVG(kgr) as avg_kgr,
      AVG(cpc) as avg_cpc
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
      AND intent IS NOT NULL
    GROUP BY intent
    ORDER BY count DESC`,
    [startDate, endDate]
  )

  // 검색량 범위별
  const volumeRangeStats = await query(
    `SELECT
      CASE
        WHEN search_volume < 100 THEN 'Very Low (0-100)'
        WHEN search_volume < 500 THEN 'Low (100-500)'
        WHEN search_volume < 1000 THEN 'Medium (500-1000)'
        WHEN search_volume < 5000 THEN 'High (1000-5000)'
        ELSE 'Very High (5000+)'
      END as volume_range,
      COUNT(*) as count,
      AVG(kgr) as avg_kgr
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY volume_range
    ORDER BY
      CASE volume_range
        WHEN 'Very Low (0-100)' THEN 1
        WHEN 'Low (100-500)' THEN 2
        WHEN 'Medium (500-1000)' THEN 3
        WHEN 'High (1000-5000)' THEN 4
        WHEN 'Very High (5000+)' THEN 5
      END`,
    [startDate, endDate]
  )

  return {
    byTrend: trendStats.rows,
    byIntent: intentStats.rows,
    byVolumeRange: volumeRangeStats.rows,
  }
}

/**
 * 트렌드 분석 (일별, 주별 변화)
 */
const getTrendAnalysis = async (startDate, endDate) => {
  // 일별 통계
  const dailyStats = await query(
    `SELECT
      DATE(created_at) as date,
      COUNT(*) as searches,
      COUNT(DISTINCT keyword_text) as unique_keywords,
      AVG(kgr) as avg_kgr,
      COUNT(CASE WHEN kgr < 0.25 THEN 1 END) as golden_count
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY DATE(created_at)
    ORDER BY date ASC`,
    [startDate, endDate]
  )

  // 주별 비교
  const weeklyComparison = await query(
    `SELECT
      DATE_TRUNC('week', created_at) as week,
      COUNT(*) as searches,
      AVG(kgr) as avg_kgr,
      COUNT(CASE WHEN kgr < 0.25 THEN 1 END) as golden_count
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week ASC`,
    [startDate, endDate]
  )

  return {
    daily: dailyStats.rows,
    weekly: weeklyComparison.rows,
  }
}

/**
 * 상위 성과 키워드
 */
const getTopKeywords = async (startDate, endDate, limit = 10) => {
  const result = await query(
    `SELECT
      keyword_text,
      search_volume,
      allintitle,
      kgr,
      kei,
      cpc,
      difficulty,
      trend,
      intent,
      created_at
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
    ORDER BY kgr ASC, search_volume DESC
    LIMIT $3`,
    [startDate, endDate, limit]
  )

  return result.rows
}

/**
 * 하위 성과 키워드 (개선 필요)
 */
const getBottomKeywords = async (startDate, endDate, limit = 10) => {
  const result = await query(
    `SELECT
      keyword_text,
      search_volume,
      allintitle,
      kgr,
      difficulty,
      created_at
    FROM keyword_metrics
    WHERE created_at BETWEEN $1 AND $2
    ORDER BY kgr DESC, search_volume ASC
    LIMIT $3`,
    [startDate, endDate, limit]
  )

  return result.rows
}

/**
 * 추천사항 생성
 */
const generateRecommendations = (reportData) => {
  const recommendations = []

  // 1. 황금 키워드 발견율 기반 추천
  const discoveryRate = parseFloat(reportData.goldenKeywordPerformance.discovery_rate)
  if (discoveryRate < 10) {
    recommendations.push({
      type: 'critical',
      category: 'discovery_rate',
      title: '황금 키워드 발견율 저조',
      message: `황금 키워드 발견율이 ${discoveryRate}%로 매우 낮습니다. 롱테일 키워드 전략을 활용하여 더 구체적인 키워드를 탐색하세요.`,
      action: '고급 분석 모드에서 롱테일 키워드 생성 기능을 활용하세요.',
    })
  } else if (discoveryRate > 30) {
    recommendations.push({
      type: 'success',
      category: 'discovery_rate',
      title: '우수한 황금 키워드 발견율',
      message: `황금 키워드 발견율이 ${discoveryRate}%로 매우 우수합니다. 현재 전략을 유지하세요.`,
      action: '발견한 황금 키워드로 즉시 콘텐츠 제작을 시작하세요.',
    })
  }

  // 2. 평균 KGR 기반 추천
  const avgKgr = parseFloat(reportData.overallStats.avg_kgr)
  if (avgKgr > 1.0) {
    recommendations.push({
      type: 'warning',
      category: 'kgr',
      title: '평균 KGR 높음',
      message: `평균 KGR이 ${avgKgr.toFixed(2)}로 높습니다. 경쟁이 너무 치열한 키워드를 탐색 중입니다.`,
      action: '최소 검색량 기준을 낮추고, 더 구체적인 롱테일 키워드를 탐색하세요.',
    })
  }

  // 3. 카테고리 다양성 추천
  const intentCount = reportData.categoryPerformance.byIntent.length
  if (intentCount < 2) {
    recommendations.push({
      type: 'info',
      category: 'diversity',
      title: '키워드 의도 다양화 필요',
      message: '다양한 키워드 의도(정보성, 거래성 등)를 균형있게 탐색하세요.',
      action: '포트폴리오 최적화를 통해 Quick Wins, Cash Cows, Long Term 키워드를 고르게 확보하세요.',
    })
  }

  // 4. 트렌드 상승 키워드 추천
  const risingTrend = reportData.categoryPerformance.byTrend.find((t) => t.trend === 'rising')
  if (risingTrend && parseInt(risingTrend.count) > 0) {
    recommendations.push({
      type: 'opportunity',
      category: 'trending',
      title: '트렌드 상승 키워드 발견',
      message: `${risingTrend.count}개의 트렌드 상승 키워드를 발견했습니다. 빠른 콘텐츠 제작이 중요합니다.`,
      action: '트렌드가 상승 중인 키워드로 즉시 콘텐츠를 제작하여 선점 효과를 누리세요.',
    })
  }

  // 5. CPC 기반 수익화 추천
  const avgCpc = parseFloat(reportData.overallStats.avg_cpc)
  if (avgCpc < 0.5) {
    recommendations.push({
      type: 'info',
      category: 'monetization',
      title: '수익화 잠재력 개선 필요',
      message: `평균 CPC가 $${avgCpc.toFixed(2)}로 낮습니다. 수익성이 높은 키워드도 함께 탐색하세요.`,
      action: 'Cash Cows 카테고리 키워드를 추가로 탐색하여 수익화 균형을 맞추세요.',
    })
  }

  // 6. 상위 키워드 활용 추천
  if (reportData.topKeywords.length > 0) {
    const topKw = reportData.topKeywords[0]
    recommendations.push({
      type: 'action',
      category: 'quick_win',
      title: '최우선 공략 키워드',
      message: `"${topKw.keyword_text}" (KGR: ${topKw.kgr}, 검색량: ${topKw.search_volume})를 최우선으로 공략하세요.`,
      action: '이 키워드로 고품질 콘텐츠를 제작하면 빠른 성과를 기대할 수 있습니다.',
    })
  }

  return recommendations
}

/**
 * 리포트 요약 생성 (간단한 버전)
 */
export const generateReportSummary = async (options = {}) => {
  const fullReport = await generatePerformanceReport(options)

  return {
    period: fullReport.period,
    summary: {
      totalKeywords: fullReport.overallStats.total_unique_keywords,
      goldenKeywords: fullReport.goldenKeywordPerformance.golden_keyword_count,
      discoveryRate: fullReport.goldenKeywordPerformance.discovery_rate,
      avgKgr: parseFloat(fullReport.overallStats.avg_kgr).toFixed(2),
      topKeyword: fullReport.topKeywords[0]?.keyword_text || 'N/A',
    },
    topRecommendations: fullReport.recommendations?.slice(0, 3) || [],
    generatedAt: fullReport.generatedAt,
  }
}

export default {
  generatePerformanceReport,
  generateReportSummary,
}
