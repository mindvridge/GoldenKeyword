/**
 * 키워드 히스토리 서비스
 * 키워드 검색 기록 추적 및 과거 데이터 비교
 */

import { query } from '../config/database.js'

/**
 * 키워드 메트릭 히스토리 저장
 * 검색할 때마다 자동으로 저장
 *
 * @param {Object} metric - 키워드 메트릭
 * @returns {Promise<Object>} 저장된 메트릭
 */
export const saveKeywordHistory = async (metric) => {
  const {
    keyword,
    searchVolume,
    cpc,
    competition,
    difficulty,
    kgr,
    kei,
    allintitle,
    serpDifficulty,
    trend,
    intent,
  } = metric

  try {
    const result = await query(
      `INSERT INTO keyword_metrics
       (keyword_text, search_volume, cpc, competition, difficulty, kgr, kei,
        allintitle, serp_difficulty, trend, intent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        keyword,
        searchVolume,
        cpc,
        competition,
        difficulty,
        kgr,
        kei,
        allintitle || null,
        serpDifficulty || null,
        trend || null,
        intent || null,
      ]
    )

    return result.rows[0]
  } catch (error) {
    console.error('Save keyword history error:', error)
    throw new Error('키워드 히스토리 저장에 실패했습니다.')
  }
}

/**
 * 키워드 히스토리 조회
 * 특정 키워드의 과거 데이터 조회
 *
 * @param {string} keyword - 키워드
 * @param {number} days - 조회 기간 (일 단위, 기본: 90일)
 * @returns {Promise<Array>} 히스토리 데이터
 */
export const getKeywordHistory = async (keyword, days = 90) => {
  try {
    const result = await query(
      `SELECT *
       FROM keyword_metrics
       WHERE keyword_text = $1
         AND created_at >= NOW() - INTERVAL '${days} days'
       ORDER BY created_at DESC`,
      [keyword]
    )

    return result.rows
  } catch (error) {
    console.error('Get keyword history error:', error)
    throw new Error('키워드 히스토리 조회에 실패했습니다.')
  }
}

/**
 * 최근 분석 키워드 목록
 * 최근 검색한 키워드 목록 조회
 *
 * @param {number} limit - 조회 개수 (기본: 50)
 * @returns {Promise<Array>} 키워드 목록
 */
export const getRecentKeywords = async (limit = 50) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (keyword_text)
         keyword_text,
         search_volume,
         kgr,
         kei,
         created_at
       FROM keyword_metrics
       ORDER BY keyword_text, created_at DESC
       LIMIT $1`,
      [limit]
    )

    return result.rows
  } catch (error) {
    console.error('Get recent keywords error:', error)
    throw new Error('최근 키워드 조회에 실패했습니다.')
  }
}

/**
 * 키워드 트렌드 변화 분석
 * 과거 데이터와 비교하여 변화 추이 분석
 *
 * @param {string} keyword - 키워드
 * @returns {Promise<Object>} 트렌드 변화 분석
 */
export const analyzeKeywordTrendChange = async (keyword) => {
  try {
    // 최근 30일 데이터
    const recent = await query(
      `SELECT *
       FROM keyword_metrics
       WHERE keyword_text = $1
         AND created_at >= NOW() - INTERVAL '30 days'
       ORDER BY created_at DESC
       LIMIT 1`,
      [keyword]
    )

    // 30-60일 전 데이터
    const previous = await query(
      `SELECT *
       FROM keyword_metrics
       WHERE keyword_text = $1
         AND created_at >= NOW() - INTERVAL '60 days'
         AND created_at < NOW() - INTERVAL '30 days'
       ORDER BY created_at DESC
       LIMIT 1`,
      [keyword]
    )

    if (recent.rows.length === 0) {
      return {
        hasData: false,
        message: '히스토리 데이터가 없습니다.',
      }
    }

    const recentData = recent.rows[0]
    const previousData = previous.rows.length > 0 ? previous.rows[0] : null

    if (!previousData) {
      return {
        hasData: true,
        hasPrevious: false,
        current: recentData,
        message: '비교할 과거 데이터가 없습니다.',
      }
    }

    // 변화율 계산
    const searchVolumeChange =
      ((recentData.search_volume - previousData.search_volume) /
        previousData.search_volume) *
      100

    const kgrChange = ((recentData.kgr - previousData.kgr) / previousData.kgr) * 100

    const difficultyChange =
      ((recentData.difficulty - previousData.difficulty) / previousData.difficulty) * 100

    const cpcChange = ((recentData.cpc - previousData.cpc) / previousData.cpc) * 100

    return {
      hasData: true,
      hasPrevious: true,
      current: recentData,
      previous: previousData,
      changes: {
        searchVolume: {
          value: recentData.search_volume - previousData.search_volume,
          percent: searchVolumeChange.toFixed(2),
          direction:
            searchVolumeChange > 0 ? 'up' : searchVolumeChange < 0 ? 'down' : 'stable',
        },
        kgr: {
          value: (recentData.kgr - previousData.kgr).toFixed(4),
          percent: kgrChange.toFixed(2),
          direction: kgrChange > 0 ? 'up' : kgrChange < 0 ? 'down' : 'stable',
          note:
            kgrChange < 0
              ? '좋아짐 (KGR 감소 = 기회 증가)'
              : '나빠짐 (KGR 증가 = 경쟁 증가)',
        },
        difficulty: {
          value: recentData.difficulty - previousData.difficulty,
          percent: difficultyChange.toFixed(2),
          direction:
            difficultyChange > 0 ? 'up' : difficultyChange < 0 ? 'down' : 'stable',
        },
        cpc: {
          value: (recentData.cpc - previousData.cpc).toFixed(2),
          percent: cpcChange.toFixed(2),
          direction: cpcChange > 0 ? 'up' : cpcChange < 0 ? 'down' : 'stable',
        },
      },
      summary: generateChangeSummary(searchVolumeChange, kgrChange),
    }
  } catch (error) {
    console.error('Analyze trend change error:', error)
    throw new Error('트렌드 변화 분석에 실패했습니다.')
  }
}

/**
 * 변화 요약 생성
 */
const generateChangeSummary = (searchVolumeChange, kgrChange) => {
  if (searchVolumeChange > 20 && kgrChange < -10) {
    return {
      level: 'excellent',
      message: '🔥 검색량 증가 + KGR 감소! 최고의 기회입니다!',
      action: 'immediate',
    }
  } else if (searchVolumeChange > 10 && kgrChange < 0) {
    return {
      level: 'good',
      message: '✨ 긍정적인 변화입니다. 콘텐츠 제작을 고려하세요.',
      action: 'consider',
    }
  } else if (searchVolumeChange < -20 || kgrChange > 20) {
    return {
      level: 'warning',
      message: '⚠️ 부정적인 변화입니다. 다른 키워드를 찾아보세요.',
      action: 'reconsider',
    }
  } else {
    return {
      level: 'neutral',
      message: '➡️ 큰 변화가 없습니다.',
      action: 'monitor',
    }
  }
}

/**
 * 키워드 성과 통계
 * 전체 키워드 분석 통계
 *
 * @returns {Promise<Object>} 통계 데이터
 */
export const getKeywordStats = async () => {
  try {
    const result = await query(`
      SELECT
        COUNT(DISTINCT keyword_text) as total_keywords,
        COUNT(*) as total_searches,
        AVG(search_volume) as avg_search_volume,
        AVG(kgr) as avg_kgr,
        AVG(kei) as avg_kei,
        AVG(difficulty) as avg_difficulty,
        COUNT(CASE WHEN kgr < 0.25 THEN 1 END) as golden_keywords,
        COUNT(CASE WHEN kgr >= 0.25 AND kgr < 1.0 THEN 1 END) as good_keywords,
        COUNT(CASE WHEN kgr >= 1.0 THEN 1 END) as difficult_keywords
      FROM keyword_metrics
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `)

    return result.rows[0]
  } catch (error) {
    console.error('Get keyword stats error:', error)
    throw new Error('키워드 통계 조회에 실패했습니다.')
  }
}

/**
 * 상위 성과 키워드
 * KGR이 낮고 검색량이 높은 키워드
 *
 * @param {number} limit - 조회 개수
 * @returns {Promise<Array>} 상위 키워드
 */
export const getTopPerformingKeywords = async (limit = 10) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (keyword_text)
         keyword_text,
         search_volume,
         kgr,
         kei,
         cpc,
         difficulty,
         created_at
       FROM keyword_metrics
       WHERE kgr < 0.5
         AND search_volume > 100
       ORDER BY keyword_text, kgr ASC, search_volume DESC
       LIMIT $1`,
      [limit]
    )

    return result.rows
  } catch (error) {
    console.error('Get top performing keywords error:', error)
    throw new Error('상위 성과 키워드 조회에 실패했습니다.')
  }
}

/**
 * 키워드 검색 빈도
 * 가장 많이 검색한 키워드
 *
 * @param {number} limit - 조회 개수
 * @returns {Promise<Array>} 검색 빈도 높은 키워드
 */
export const getMostSearchedKeywords = async (limit = 10) => {
  try {
    const result = await query(
      `SELECT
         keyword_text,
         COUNT(*) as search_count,
         AVG(kgr) as avg_kgr,
         AVG(search_volume) as avg_search_volume
       FROM keyword_metrics
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY keyword_text
       ORDER BY search_count DESC
       LIMIT $1`,
      [limit]
    )

    return result.rows
  } catch (error) {
    console.error('Get most searched keywords error:', error)
    throw new Error('검색 빈도 조회에 실패했습니다.')
  }
}

/**
 * 일별 키워드 검색 통계
 * 최근 30일간 일별 검색 통계
 *
 * @returns {Promise<Array>} 일별 통계
 */
export const getDailySearchStats = async () => {
  try {
    const result = await query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total_searches,
        COUNT(DISTINCT keyword_text) as unique_keywords,
        AVG(kgr) as avg_kgr,
        COUNT(CASE WHEN kgr < 0.25 THEN 1 END) as golden_count
      FROM keyword_metrics
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    return result.rows
  } catch (error) {
    console.error('Get daily search stats error:', error)
    throw new Error('일별 검색 통계 조회에 실패했습니다.')
  }
}

export default {
  saveKeywordHistory,
  getKeywordHistory,
  getRecentKeywords,
  analyzeKeywordTrendChange,
  getKeywordStats,
  getTopPerformingKeywords,
  getMostSearchedKeywords,
  getDailySearchStats,
}
