/**
 * 고급 키워드 분석 서비스
 * 실제 Allintitle 검색 결과 및 SERP 분석
 */

import axios from 'axios'
import { calculateKGR, calculateKEI } from '../utils/calculations.js'

const DATAFORSEO_API = 'https://api.dataforseo.com/v3'

/**
 * DataForSEO API 클라이언트 생성
 */
const createClient = () => {
  const username = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!username || !password) {
    console.warn('DataForSEO credentials not configured.')
    return null
  }

  return axios.create({
    baseURL: DATAFORSEO_API,
    auth: { username, password },
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * 실제 Allintitle 검색 결과 수 가져오기 (핵심 개선!)
 * Google SERP API를 사용하여 정확한 allintitle: 결과 수 획득
 */
const getAllintitleCount = async (client, keyword, location = 'KR') => {
  try {
    const response = await client.post('/serp/google/organic/live/advanced', [
      {
        keyword: `allintitle:${keyword}`,
        location_code: location === 'KR' ? 2410 : 2840,
        language_code: location === 'KR' ? 'ko' : 'en',
        device: 'desktop',
        os: 'windows',
      },
    ])

    if (response.data?.tasks?.[0]?.result?.[0]) {
      const result = response.data.tasks[0].result[0]
      // 실제 검색 결과 수
      return result.items_count || 0
    }
    return 0
  } catch (error) {
    console.error('Allintitle count error:', error.message)
    return 0
  }
}

/**
 * SERP 분석 - 상위 10개 사이트의 도메인 권한 분석
 */
const analyzeSERP = async (client, keyword, location = 'KR') => {
  try {
    const response = await client.post('/serp/google/organic/live/advanced', [
      {
        keyword,
        location_code: location === 'KR' ? 2410 : 2840,
        language_code: location === 'KR' ? 'ko' : 'en',
        device: 'desktop',
        depth: 10, // 상위 10개만
      },
    ])

    if (response.data?.tasks?.[0]?.result?.[0]?.items) {
      const items = response.data.tasks[0].result[0].items

      // 도메인 권한 분석
      const domainAuthorities = items
        .filter((item) => item.type === 'organic')
        .map((item) => ({
          url: item.url,
          domain: item.domain,
          rank: item.rank_group,
          title: item.title,
          // DataForSEO의 도메인 메트릭
          domainRank: item.domain_rank || 0,
        }))

      // 평균 도메인 권한 계산
      const avgDomainRank =
        domainAuthorities.reduce((sum, item) => sum + item.domainRank, 0) /
        domainAuthorities.length

      return {
        topDomains: domainAuthorities,
        avgDomainRank,
        serpDifficulty: calculateSERPDifficulty(domainAuthorities),
        weakSpots: findWeakSpots(domainAuthorities), // 약한 사이트 찾기
      }
    }
    return null
  } catch (error) {
    console.error('SERP analysis error:', error.message)
    return null
  }
}

/**
 * SERP 난이도 계산
 * 상위 사이트의 도메인 권한을 기반으로 진입 난이도 계산
 */
const calculateSERPDifficulty = (domains) => {
  if (!domains || domains.length === 0) return 100

  // 상위 3개 사이트의 평균 도메인 랭크
  const top3 = domains.slice(0, 3)
  const avgRank = top3.reduce((sum, d) => sum + d.domainRank, 0) / top3.length

  // 도메인 랭크가 낮을수록 진입하기 쉬움
  // 100 - (avgRank / 100 * 100) = 난이도
  return Math.min(100, Math.max(0, avgRank / 100))
}

/**
 * 약한 경쟁사 찾기
 * 도메인 권한이 낮은 사이트가 상위에 있으면 기회!
 */
const findWeakSpots = (domains) => {
  if (!domains || domains.length === 0) return []

  // 상위 10개 중 도메인 랭크가 50 이하인 사이트
  return domains.filter((d) => d.rank <= 10 && d.domainRank < 50)
}

/**
 * 키워드 트렌드 분석 (12개월)
 */
const getKeywordTrends = async (client, keyword, location = 'KR') => {
  try {
    const response = await client.post('/keywords_data/google_trends/explore/live', [
      {
        keywords: [keyword],
        location_code: location === 'KR' ? 2410 : 2840,
        language_code: location === 'KR' ? 'ko' : 'en',
        time_range: 'past_12_months',
      },
    ])

    if (response.data?.tasks?.[0]?.result?.[0]?.data) {
      const trendData = response.data.tasks[0].result[0].data

      // 추세 분석
      const values = trendData.map((d) => d.values?.[0] || 0)
      const trend = calculateTrend(values)
      const seasonality = detectSeasonality(values)

      return {
        trendData,
        trend, // 'rising', 'stable', 'declining'
        seasonality, // { isseasonal: boolean, peakMonth: number }
        avgInterest: values.reduce((a, b) => a + b, 0) / values.length,
      }
    }
    return null
  } catch (error) {
    console.error('Trend analysis error:', error.message)
    return null
  }
}

/**
 * 추세 계산
 */
const calculateTrend = (values) => {
  if (values.length < 2) return 'stable'

  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  const change = ((avgSecond - avgFirst) / avgFirst) * 100

  if (change > 20) return 'rising'
  if (change < -20) return 'declining'
  return 'stable'
}

/**
 * 계절성 감지
 */
const detectSeasonality = (values) => {
  if (values.length < 12) return { isseasonal: false, peakMonth: null }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const variance = max - min

  // 변동성이 평균의 50% 이상이면 계절성 있음
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const isseasonal = variance / avg > 0.5

  const peakMonth = values.indexOf(max)

  return { isseasonal, peakMonth }
}

/**
 * 키워드 의도(Intent) 분석
 */
const analyzeKeywordIntent = (keyword, serpData) => {
  // 거래성 키워드 패턴
  const transactionalPatterns = [
    '구매',
    '가격',
    '할인',
    '쿠폰',
    '최저가',
    '판매',
    'buy',
    'price',
    'discount',
    'cheap',
  ]

  // 정보성 키워드 패턴
  const informationalPatterns = [
    '방법',
    '어떻게',
    '왜',
    '무엇',
    '추천',
    '비교',
    'how',
    'what',
    'why',
    'guide',
    'tutorial',
  ]

  const keywordLower = keyword.toLowerCase()

  let intent = 'navigational' // 기본값
  let monetizationPotential = 0

  // 거래성 의도
  if (transactionalPatterns.some((p) => keywordLower.includes(p))) {
    intent = 'transactional'
    monetizationPotential = 80 // 높은 수익화 가능성
  }
  // 정보성 의도
  else if (informationalPatterns.some((p) => keywordLower.includes(p))) {
    intent = 'informational'
    monetizationPotential = 40 // 중간 수익화 가능성 (애드센스)
  }

  return { intent, monetizationPotential }
}

/**
 * 고급 키워드 분석 (모든 메트릭 통합)
 */
export const advancedKeywordAnalysis = async (keyword, params = {}) => {
  const client = createClient()
  if (!client) {
    return null
  }

  const location = params.location || 'KR'

  try {
    // 병렬로 모든 데이터 가져오기
    const [allintitleCount, serpAnalysis, trendData] = await Promise.all([
      getAllintitleCount(client, keyword, location),
      analyzeSERP(client, keyword, location),
      getKeywordTrends(client, keyword, location),
    ])

    // 검색량 가져오기 (기존 API)
    const volumeResponse = await client.post('/keywords_data/google_ads/search_volume/live', [
      {
        keywords: [keyword],
        location_code: location === 'KR' ? 2410 : 2840,
        language_code: location === 'KR' ? 'ko' : 'en',
      },
    ])

    const searchVolume = volumeResponse.data?.tasks?.[0]?.result?.[0]?.search_volume || 0
    const competition = volumeResponse.data?.tasks?.[0]?.result?.[0]?.competition || 0
    const cpc = volumeResponse.data?.tasks?.[0]?.result?.[0]?.cpc || 0

    // 실제 KGR 계산 (실제 allintitle 사용!)
    const kgr = calculateKGR(allintitleCount, searchVolume)
    const kei = calculateKEI(searchVolume, competition)

    // 키워드 의도 분석
    const intentAnalysis = analyzeKeywordIntent(keyword, serpAnalysis)

    // 황금 키워드 점수 계산 (개선된 버전)
    const goldenScore = calculateGoldenScore({
      kgr,
      kei,
      searchVolume,
      cpc,
      serpDifficulty: serpAnalysis?.serpDifficulty || 50,
      trend: trendData?.trend || 'stable',
      intent: intentAnalysis.intent,
      weakSpots: serpAnalysis?.weakSpots?.length || 0,
    })

    return {
      keyword,
      searchVolume,
      allintitleCount, // 실제 값!
      competition,
      cpc,
      kgr: parseFloat(kgr),
      kei,
      serpAnalysis,
      trendData,
      intentAnalysis,
      goldenScore,
      recommendation: getRecommendation(goldenScore, kgr, trendData),
    }
  } catch (error) {
    console.error('Advanced analysis error:', error)
    return null
  }
}

/**
 * 황금 키워드 점수 계산 (개선된 버전)
 */
const calculateGoldenScore = (data) => {
  let score = 0

  // 1. KGR 점수 (40점) - 가장 중요!
  if (data.kgr < 0.25) score += 40
  else if (data.kgr < 0.5) score += 32
  else if (data.kgr < 1.0) score += 24
  else if (data.kgr < 2.0) score += 12
  else score += 5

  // 2. 검색량 점수 (20점)
  if (data.searchVolume >= 1000) score += 20
  else if (data.searchVolume >= 500) score += 16
  else if (data.searchVolume >= 250) score += 12
  else if (data.searchVolume >= 100) score += 8
  else score += 4

  // 3. SERP 난이도 점수 (15점) - 낮을수록 좋음
  if (data.serpDifficulty < 30) score += 15
  else if (data.serpDifficulty < 50) score += 10
  else if (data.serpDifficulty < 70) score += 5
  else score += 2

  // 4. 트렌드 점수 (10점)
  if (data.trend === 'rising') score += 10
  else if (data.trend === 'stable') score += 6
  else score += 2

  // 5. CPC/수익성 점수 (10점)
  if (data.cpc >= 5) score += 10
  else if (data.cpc >= 2) score += 7
  else if (data.cpc >= 1) score += 5
  else score += 2

  // 6. 약한 경쟁사 보너스 (5점)
  if (data.weakSpots >= 3) score += 5
  else if (data.weakSpots >= 1) score += 3

  return Math.min(100, score)
}

/**
 * 추천 메시지 생성
 */
const getRecommendation = (score, kgr, trendData) => {
  if (score >= 80 && kgr < 0.25) {
    return {
      level: 'excellent',
      message: '🏆 최고의 황금 키워드! 즉시 콘텐츠 제작을 시작하세요.',
      action: 'create_content_now',
    }
  } else if (score >= 60 && kgr < 0.5) {
    return {
      level: 'good',
      message: '✨ 좋은 기회입니다. 경쟁이 낮고 검색량이 적절합니다.',
      action: 'consider_content',
    }
  } else if (score >= 40) {
    return {
      level: 'moderate',
      message: '⚠️ 중간 수준입니다. 롱테일 변형을 고려하세요.',
      action: 'find_longtail',
    }
  } else {
    return {
      level: 'difficult',
      message: '❌ 경쟁이 높습니다. 다른 키워드를 찾아보세요.',
      action: 'skip',
    }
  }
}

export default {
  advancedKeywordAnalysis,
  getAllintitleCount,
  analyzeSERP,
  getKeywordTrends,
}
