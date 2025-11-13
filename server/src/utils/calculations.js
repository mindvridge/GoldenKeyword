/**
 * 키워드 분석 계산 유틸리티 (서버용)
 */

/**
 * KGR (Keyword Golden Ratio) 계산
 */
export const calculateKGR = (allintitleResults, searchVolume) => {
  if (!searchVolume || searchVolume === 0) return 0
  return (allintitleResults / searchVolume).toFixed(4)
}

/**
 * KEI (Keyword Efficiency Index) 계산
 */
export const calculateKEI = (searchVolume, competition) => {
  if (!competition || competition === 0) return 0
  const normalizedCompetition = competition <= 1 ? competition * 100 : competition
  return Math.round((searchVolume * searchVolume) / normalizedCompetition)
}

/**
 * 키워드 점수 계산
 */
export const calculateKeywordScore = (keyword) => {
  const { searchVolume, kgr, kei, cpc } = keyword
  let score = 0

  // 검색량 점수 (30점)
  if (searchVolume >= 1000) score += 30
  else if (searchVolume >= 500) score += 25
  else if (searchVolume >= 250) score += 20
  else if (searchVolume >= 100) score += 15
  else score += 10

  // KGR 점수 (35점)
  if (kgr < 0.25) score += 35
  else if (kgr < 0.5) score += 28
  else if (kgr < 1.0) score += 20
  else if (kgr < 2.0) score += 10
  else score += 5

  // KEI 점수 (20점)
  if (kei > 100) score += 20
  else if (kei > 50) score += 15
  else if (kei > 10) score += 10
  else score += 5

  // CPC 점수 (15점)
  if (cpc >= 5) score += 15
  else if (cpc >= 2) score += 12
  else if (cpc >= 1) score += 9
  else if (cpc >= 0.5) score += 6
  else score += 3

  return Math.min(100, score)
}

export default {
  calculateKGR,
  calculateKEI,
  calculateKeywordScore,
}
