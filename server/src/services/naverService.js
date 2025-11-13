/**
 * Naver API 서비스
 * 네이버 키워드 광고 API 연동
 */

import axios from 'axios'
import { calculateKGR, calculateKEI } from '../utils/calculations.js'

const NAVER_API_BASE = 'https://api.naver.com'

/**
 * 네이버 키워드 검색
 *
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<Array>} 키워드 목록
 */
export const searchKeywords = async (keyword) => {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  // API 미설정시 더미 데이터 반환
  if (!clientId || !clientSecret) {
    console.warn('Naver API credentials not configured. Using mock data.')
    return generateMockNaverKeywords(keyword)
  }

  try {
    // 네이버 검색광고 API 호출
    const response = await axios.get(`${NAVER_API_BASE}/keywordstool`, {
      params: {
        hintKeywords: keyword,
        showDetail: 1,
      },
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    })

    return parseNaverResponse(response.data)
  } catch (error) {
    console.error('Naver API Error:', error.message)
    return generateMockNaverKeywords(keyword)
  }
}

/**
 * 네이버 API 응답 파싱
 */
const parseNaverResponse = (data) => {
  if (!data.keywordList || data.keywordList.length === 0) return []

  return data.keywordList.map((item, index) => {
    const searchVolume = parseInt(item.monthlyPcQcCnt) + parseInt(item.monthlyMobileQcCnt)
    const allintitle = Math.floor(searchVolume * 0.15) // 추정값
    const competition = parseFloat(item.compIdx)
    const cpc = parseFloat(item.avgCpc)

    const kgr = calculateKGR(allintitle, searchVolume)
    const kei = calculateKEI(searchVolume, competition)

    return {
      id: index + 1,
      keyword: item.relKeyword,
      searchVolume,
      allintitle,
      competition: parseFloat((competition * 100).toFixed(2)),
      cpc: parseFloat((cpc / 1000).toFixed(2)), // KRW to USD (approximate)
      kgr: parseFloat(kgr),
      kei,
      difficulty: Math.floor(competition * 100),
      platform: 'naver',
    }
  })
}

/**
 * 더미 네이버 키워드 데이터 (개발/테스트용)
 */
const generateMockNaverKeywords = (seedKeyword) => {
  const keywords = []
  const koreanTerms = [
    '추천',
    '후기',
    '가격',
    '구매',
    '리뷰',
    '비교',
    '사용법',
    '효과',
    '순위',
    '인기',
    '최저가',
    '할인',
    '쿠폰',
    '판매',
    '브랜드',
  ]

  for (let i = 0; i < koreanTerms.length; i++) {
    const term = koreanTerms[i]
    const searchVolume = Math.floor(Math.random() * 50000) + 1000
    const allintitle = Math.floor(Math.random() * 2000) + 50
    const competition = Math.random()
    const cpc = Math.random() * 3 // KRW 환산 (대략 $0-3)

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
      platform: 'naver',
    })
  }

  return keywords.sort((a, b) => a.kgr - b.kgr)
}

export default {
  searchKeywords,
}
