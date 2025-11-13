/**
 * DataForSEO API 서비스
 * 키워드 데이터 조회
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
    console.warn('DataForSEO credentials not configured. Using mock data.')
    return null
  }

  return axios.create({
    baseURL: DATAFORSEO_API,
    auth: {
      username,
      password,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 키워드 검색
 *
 * @param {Object} params - 검색 파라미터
 * @returns {Promise<Array>} 키워드 목록
 */
export const searchKeywords = async (params) => {
  const client = createClient()

  // API 미설정시 더미 데이터 반환
  if (!client) {
    return generateMockKeywords(params.keyword, 50)
  }

  try {
    // DataForSEO Keywords API 호출
    const response = await client.post('/keywords_data/google_ads/search_volume/live', [
      {
        keywords: [params.keyword],
        location_code: params.location === 'KR' ? 2410 : 2840, // 한국: 2410, 미국: 2840
        language_code: params.language === 'ko' ? 'ko' : 'en',
        search_partners: false,
        date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
      },
    ])

    // 응답 데이터 파싱
    const keywords = parseDataForSEOResponse(response.data, params)

    // 필터링
    return keywords.filter(
      (k) =>
        k.searchVolume >= params.minVolume &&
        k.difficulty <= params.maxDifficulty
    )
  } catch (error) {
    console.error('DataForSEO API Error:', error.message)
    // 에러 시 더미 데이터 반환
    return generateMockKeywords(params.keyword, 50)
  }
}

/**
 * DataForSEO 응답 파싱
 */
const parseDataForSEOResponse = (data, params) => {
  if (!data.tasks || data.tasks.length === 0) return []

  const task = data.tasks[0]
  if (!task.result || task.result.length === 0) return []

  return task.result.map((item, index) => {
    const searchVolume = item.search_volume || 0
    const allintitle = Math.floor(searchVolume * 0.1) // 추정값
    const competition = item.competition || 0
    const cpc = item.cpc || 0

    const kgr = calculateKGR(allintitle, searchVolume)
    const kei = calculateKEI(searchVolume, competition)

    return {
      id: index + 1,
      keyword: item.keyword,
      searchVolume,
      allintitle,
      competition: parseFloat((competition * 100).toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      kgr: parseFloat(kgr),
      kei,
      difficulty: item.keyword_difficulty || Math.floor(Math.random() * 100),
    }
  })
}

/**
 * 더미 키워드 데이터 생성 (개발/테스트용)
 */
const generateMockKeywords = (seedKeyword, count) => {
  const keywords = []
  const relatedTerms = [
    '추천',
    '가격',
    '비교',
    '후기',
    '사용법',
    '팁',
    '방법',
    '종류',
    '순위',
    '인기',
    '리뷰',
    '효과',
    '장점',
    '단점',
    '구매',
    '판매',
    '최저가',
    '할인',
    '쿠폰',
    '이벤트',
    '신제품',
    '베스트',
    '랭킹',
    '성분',
    '효능',
    '부작용',
    '사용후기',
    '체험단',
    '무료',
    '저렴한',
  ]

  for (let i = 0; i < count; i++) {
    const term = relatedTerms[i % relatedTerms.length]
    const searchVolume = Math.floor(Math.random() * 10000) + 100
    const allintitle = Math.floor(Math.random() * 1000) + 10
    const competition = Math.random()
    const cpc = Math.random() * 15

    const kgr = calculateKGR(allintitle, searchVolume)
    const kei = calculateKEI(searchVolume, competition)

    keywords.push({
      id: i + 1,
      keyword: `${seedKeyword} ${term}`,
      searchVolume,
      allintitle,
      competition: parseFloat((competition * 100).toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      kgr: parseFloat(kgr),
      kei,
      difficulty: Math.floor(Math.random() * 100),
    })
  }

  // KGR 기준으로 정렬
  return keywords.sort((a, b) => a.kgr - b.kgr)
}

export default {
  searchKeywords,
}
