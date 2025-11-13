/**
 * 키워드 분석 알고리즘 유틸리티
 * KGR (Keyword Golden Ratio) 및 KEI (Keyword Efficiency Index) 계산
 */

/**
 * KGR (Keyword Golden Ratio) 계산
 * KGR = "Allintitle" 검색 결과 수 / 월간 검색량
 *
 * @param {number} allintitleResults - "Allintitle" 검색 결과 수
 * @param {number} searchVolume - 월간 검색량
 * @returns {number} KGR 값
 *
 * 해석:
 * - KGR < 0.25: 황금 키워드 (매우 좋음)
 * - KGR 0.25-1.0: 양호한 키워드
 * - KGR > 1.0: 경쟁이 높은 키워드 (부적합)
 */
export const calculateKGR = (allintitleResults, searchVolume) => {
  if (!searchVolume || searchVolume === 0) return 0
  return (allintitleResults / searchVolume).toFixed(4)
}

/**
 * KEI (Keyword Efficiency Index) 계산
 * KEI = (검색량)² / 경쟁도
 *
 * @param {number} searchVolume - 월간 검색량
 * @param {number} competition - 경쟁도 (0-100 또는 0-1)
 * @returns {number} KEI 값
 *
 * 해석:
 * - 높을수록 좋은 기회
 * - KEI > 100: 매우 좋은 키워드
 * - KEI 10-100: 좋은 키워드
 * - KEI < 10: 경쟁이 높거나 검색량이 낮음
 */
export const calculateKEI = (searchVolume, competition) => {
  if (!competition || competition === 0) return 0

  // 경쟁도가 0-1 범위인 경우 0-100으로 변환
  const normalizedCompetition = competition <= 1 ? competition * 100 : competition

  return Math.round((searchVolume * searchVolume) / normalizedCompetition)
}

/**
 * 키워드 난이도 평가
 *
 * @param {number} kgr - KGR 값
 * @returns {string} 난이도 등급
 */
export const getKGRRating = (kgr) => {
  if (kgr < 0.25) return 'excellent' // 황금 키워드
  if (kgr < 1.0) return 'good' // 양호
  return 'difficult' // 어려움
}

/**
 * 키워드 난이도 라벨
 *
 * @param {number} kgr - KGR 값
 * @returns {string} 난이도 라벨
 */
export const getKGRLabel = (kgr) => {
  if (kgr < 0.25) return '황금 키워드'
  if (kgr < 1.0) return '양호'
  return '경쟁 높음'
}

/**
 * KEI 등급 평가
 *
 * @param {number} kei - KEI 값
 * @returns {string} KEI 등급
 */
export const getKEIRating = (kei) => {
  if (kei > 100) return 'excellent'
  if (kei > 10) return 'good'
  return 'poor'
}

/**
 * KEI 라벨
 *
 * @param {number} kei - KEI 값
 * @returns {string} KEI 라벨
 */
export const getKEILabel = (kei) => {
  if (kei > 100) return '매우 좋음'
  if (kei > 10) return '좋음'
  return '낮음'
}

/**
 * 키워드 점수 계산 (종합 평가)
 * 검색량, KGR, KEI, CPC를 종합하여 0-100점 계산
 *
 * @param {Object} keyword - 키워드 데이터
 * @returns {number} 종합 점수 (0-100)
 */
export const calculateKeywordScore = (keyword) => {
  const { searchVolume, kgr, kei, cpc } = keyword

  let score = 0

  // 검색량 점수 (최대 30점)
  if (searchVolume >= 1000) score += 30
  else if (searchVolume >= 500) score += 25
  else if (searchVolume >= 250) score += 20
  else if (searchVolume >= 100) score += 15
  else score += 10

  // KGR 점수 (최대 35점)
  if (kgr < 0.25) score += 35
  else if (kgr < 0.5) score += 28
  else if (kgr < 1.0) score += 20
  else if (kgr < 2.0) score += 10
  else score += 5

  // KEI 점수 (최대 20점)
  if (kei > 100) score += 20
  else if (kei > 50) score += 15
  else if (kei > 10) score += 10
  else score += 5

  // CPC 점수 (최대 15점) - 높은 CPC는 수익성이 좋음
  if (cpc >= 5) score += 15
  else if (cpc >= 2) score += 12
  else if (cpc >= 1) score += 9
  else if (cpc >= 0.5) score += 6
  else score += 3

  return Math.min(100, score)
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 *
 * @param {number} num - 숫자
 * @returns {string} 포맷된 문자열
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

/**
 * CPC 포맷팅 (통화)
 *
 * @param {number} cpc - CPC 값
 * @param {string} currency - 통화 코드 (기본: USD)
 * @returns {string} 포맷된 통화 문자열
 */
export const formatCurrency = (cpc, currency = 'USD') => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
  }).format(cpc)
}
