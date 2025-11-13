/**
 * AI 기반 키워드 추천 서비스
 * 머신러닝 스타일의 패턴 인식 및 추천
 */

/**
 * 키워드 유사도 계산 (Jaccard Similarity)
 */
const calculateSimilarity = (keyword1, keyword2) => {
  const words1 = new Set(keyword1.toLowerCase().split(' '))
  const words2 = new Set(keyword2.toLowerCase().split(' '))

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

/**
 * 키워드 패턴 학습
 * 성공한 키워드의 패턴을 분석
 */
export const learnKeywordPatterns = (successfulKeywords) => {
  const patterns = {
    commonWords: {},
    commonPrefixes: {},
    commonSuffixes: {},
    avgWordCount: 0,
    avgKGR: 0,
    avgSearchVolume: 0,
  }

  // 단어 빈도 분석
  successfulKeywords.forEach((kw) => {
    const words = kw.keyword.toLowerCase().split(' ')

    words.forEach((word) => {
      patterns.commonWords[word] = (patterns.commonWords[word] || 0) + 1
    })

    // 접두사/접미사 분석
    if (words.length > 0) {
      const prefix = words[0]
      const suffix = words[words.length - 1]

      patterns.commonPrefixes[prefix] =
        (patterns.commonPrefixes[prefix] || 0) + 1
      patterns.commonSuffixes[suffix] =
        (patterns.commonSuffixes[suffix] || 0) + 1
    }
  })

  // 평균 메트릭 계산
  patterns.avgWordCount =
    successfulKeywords.reduce(
      (sum, kw) => sum + kw.keyword.split(' ').length,
      0
    ) / successfulKeywords.length

  patterns.avgKGR =
    successfulKeywords.reduce((sum, kw) => sum + kw.kgr, 0) /
    successfulKeywords.length

  patterns.avgSearchVolume =
    successfulKeywords.reduce((sum, kw) => sum + kw.searchVolume, 0) /
    successfulKeywords.length

  return patterns
}

/**
 * 패턴 기반 키워드 추천
 */
export const recommendKeywordsByPattern = (
  candidateKeywords,
  patterns
) => {
  const recommendations = candidateKeywords.map((kw) => {
    let score = 0
    const words = kw.keyword.toLowerCase().split(' ')

    // 1. 공통 단어 매칭
    words.forEach((word) => {
      if (patterns.commonWords[word]) {
        score += patterns.commonWords[word] * 10
      }
    })

    // 2. 접두사/접미사 매칭
    if (words.length > 0) {
      const prefix = words[0]
      const suffix = words[words.length - 1]

      if (patterns.commonPrefixes[prefix]) {
        score += patterns.commonPrefixes[prefix] * 5
      }
      if (patterns.commonSuffixes[suffix]) {
        score += patterns.commonSuffixes[suffix] * 5
      }
    }

    // 3. 단어 수 유사도
    const wordCountDiff = Math.abs(
      words.length - patterns.avgWordCount
    )
    score += Math.max(0, 10 - wordCountDiff * 2)

    // 4. KGR 유사도
    const kgrDiff = Math.abs(kw.kgr - patterns.avgKGR)
    score += Math.max(0, 20 - kgrDiff * 20)

    return {
      ...kw,
      aiScore: Math.min(100, score),
    }
  })

  // AI 점수 기준으로 정렬
  return recommendations.sort((a, b) => b.aiScore - a.aiScore)
}

/**
 * 시맨틱 키워드 확장
 * 의미적으로 유사한 키워드 추천
 */
export const expandSemanticKeywords = (seedKeyword) => {
  const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(seedKeyword)

  // 시맨틱 관계 사전
  const semanticRelations = {
    synonyms: {
      ko: {
        방법: ['팁', '노하우', '비법', '요령'],
        가격: ['비용', '금액', '가격대', '시세'],
        추천: ['추천템', '베스트', '인기', '순위'],
        구매: ['구입', '사기', '주문'],
      },
      en: {
        guide: ['tutorial', 'how-to', 'instructions'],
        best: ['top', 'recommended', 'popular'],
        cheap: ['affordable', 'budget', 'economical'],
        buy: ['purchase', 'order', 'get'],
      },
    },
    related: {
      ko: {
        다이어트: ['운동', '식단', '칼로리', '체중감량', '건강'],
        블로그: ['애드센스', '수익화', 'SEO', '글쓰기', '트래픽'],
        부동산: ['아파트', '전세', '매매', '투자', '시세'],
      },
      en: {
        seo: ['backlinks', 'keywords', 'ranking', 'traffic', 'optimization'],
        fitness: ['workout', 'diet', 'exercise', 'nutrition', 'health'],
        coding: ['programming', 'development', 'software', 'tutorial'],
      },
    },
  }

  const expanded = []
  const words = seedKeyword.toLowerCase().split(' ')

  // 동의어 치환
  words.forEach((word) => {
    const syns = isKorean
      ? semanticRelations.synonyms.ko[word]
      : semanticRelations.synonyms.en[word]

    if (syns) {
      syns.forEach((syn) => {
        const newKeyword = seedKeyword.replace(word, syn)
        expanded.push(newKeyword)
      })
    }
  })

  // 관련 키워드 추가
  const relatedWords = isKorean
    ? semanticRelations.related.ko[seedKeyword.toLowerCase()]
    : semanticRelations.related.en[seedKeyword.toLowerCase()]

  if (relatedWords) {
    relatedWords.forEach((related) => {
      expanded.push(`${seedKeyword} ${related}`)
      if (isKorean) {
        expanded.push(`${related} ${seedKeyword}`)
      }
    })
  }

  return [...new Set(expanded)]
}

/**
 * 경쟁사 키워드 역분석
 * 경쟁사가 타겟팅하는 키워드 추출
 */
export const reverseEngineerCompetitors = (competitorUrls) => {
  // 실제 구현 시 DataForSEO의 Competitor Analysis API 사용
  // 여기서는 개념적 구현

  const insights = {
    topKeywords: [],
    keywordGaps: [], // 경쟁사는 타겟팅하지만 우리는 안하는 키워드
    opportunities: [], // 경쟁사가 약한 키워드
  }

  // 실제 API 호출 예시:
  // const response = await client.post('/dataforseo_labs/google/competitors_domain/live', [
  //   {
  //     target: competitorUrl,
  //     location_code: 2410,
  //     language_code: 'ko',
  //   }
  // ])

  return insights
}

/**
 * 트렌드 예측 (시계열 분석)
 */
export const predictKeywordTrend = (historicalData) => {
  if (!historicalData || historicalData.length < 3) {
    return {
      prediction: 'insufficient_data',
      confidence: 0,
    }
  }

  // 단순 선형 회귀
  const n = historicalData.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  historicalData.forEach((point, index) => {
    const x = index
    const y = point.value || point

    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  })

  // 기울기 계산
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  // 다음 3개월 예측
  const predictions = []
  for (let i = 0; i < 3; i++) {
    const nextX = n + i
    const predictedY = slope * nextX + (sumY - slope * sumX) / n
    predictions.push(Math.max(0, Math.round(predictedY)))
  }

  // 추세 판단
  let trendDirection = 'stable'
  if (slope > 10) trendDirection = 'rising'
  else if (slope < -10) trendDirection = 'declining'

  // 신뢰도 계산 (R-squared 근사)
  const meanY = sumY / n
  let ssTotal = 0
  let ssResidual = 0

  historicalData.forEach((point, index) => {
    const y = point.value || point
    const predictedY = slope * index + (sumY - slope * sumX) / n
    ssTotal += (y - meanY) ** 2
    ssResidual += (y - predictedY) ** 2
  })

  const rSquared = 1 - ssResidual / ssTotal
  const confidence = Math.max(0, Math.min(100, rSquared * 100))

  return {
    prediction: trendDirection,
    nextThreeMonths: predictions,
    confidence: Math.round(confidence),
    slope,
  }
}

/**
 * 실시간 급상승 키워드 감지
 */
export const detectViralKeywords = async (keywords) => {
  // 실제 구현 시 Google Trends API 또는 DataForSEO Trends 사용
  const viral = []

  keywords.forEach((kw) => {
    // 최근 7일 vs 이전 7일 비교
    if (kw.recentSearchVolume && kw.previousSearchVolume) {
      const growth =
        ((kw.recentSearchVolume - kw.previousSearchVolume) /
          kw.previousSearchVolume) *
        100

      // 100% 이상 성장하면 급상승
      if (growth >= 100) {
        viral.push({
          ...kw,
          growthRate: growth,
          viralScore: Math.min(100, growth / 5),
          status: 'viral',
        })
      }
    }
  })

  return viral.sort((a, b) => b.growthRate - a.growthRate)
}

/**
 * 키워드 기회 점수 (AI 기반)
 * 여러 지표를 ML 스타일로 종합
 */
export const calculateOpportunityScore = (keywordData) => {
  const {
    kgr,
    searchVolume,
    cpc,
    serpDifficulty,
    trend,
    weakSpots,
    trendPrediction,
    aiScore,
  } = keywordData

  // 가중치 (학습 가능)
  const weights = {
    kgr: 0.35, // 가장 중요
    searchVolume: 0.15,
    cpc: 0.1,
    serpDifficulty: 0.15,
    trend: 0.1,
    weakSpots: 0.05,
    trendPrediction: 0.05,
    aiScore: 0.05,
  }

  // 각 지표 정규화 (0-100)
  const normalized = {
    kgr: kgr < 0.25 ? 100 : kgr < 1.0 ? 60 : 20,
    searchVolume: Math.min(100, (searchVolume / 1000) * 50),
    cpc: Math.min(100, cpc * 10),
    serpDifficulty: 100 - serpDifficulty,
    trend: trend === 'rising' ? 100 : trend === 'stable' ? 60 : 20,
    weakSpots: Math.min(100, weakSpots * 20),
    trendPrediction:
      trendPrediction?.prediction === 'rising'
        ? trendPrediction.confidence
        : 50,
    aiScore: aiScore || 50,
  }

  // 가중 평균 계산
  let opportunityScore = 0
  Object.keys(weights).forEach((key) => {
    opportunityScore += normalized[key] * weights[key]
  })

  return Math.round(opportunityScore)
}

/**
 * 키워드 포트폴리오 최적화
 * 다양한 유형의 키워드를 균형있게 추천
 */
export const optimizeKeywordPortfolio = (keywords) => {
  const portfolio = {
    quickWins: [], // 빠른 성과 (KGR < 0.25, 검색량 100-500)
    cashCows: [], // 수익 창출 (CPC > 2, KGR < 1.0)
    longTerm: [], // 장기 투자 (검색량 > 1000, KGR < 1.0)
    trending: [], // 트렌딩 (rising trend)
    lowHanging: [], // 쉬운 타겟 (weakSpots > 3)
  }

  keywords.forEach((kw) => {
    // Quick Wins
    if (
      kw.kgr < 0.25 &&
      kw.searchVolume >= 100 &&
      kw.searchVolume <= 500
    ) {
      portfolio.quickWins.push(kw)
    }

    // Cash Cows
    if (kw.cpc > 2 && kw.kgr < 1.0) {
      portfolio.cashCows.push(kw)
    }

    // Long Term
    if (kw.searchVolume > 1000 && kw.kgr < 1.0) {
      portfolio.longTerm.push(kw)
    }

    // Trending
    if (kw.trend === 'rising') {
      portfolio.trending.push(kw)
    }

    // Low Hanging Fruits
    if (kw.weakSpots && kw.weakSpots > 3) {
      portfolio.lowHanging.push(kw)
    }
  })

  // 각 카테고리에서 상위 5개씩
  Object.keys(portfolio).forEach((category) => {
    portfolio[category] = portfolio[category]
      .sort((a, b) => b.goldenScore - a.goldenScore)
      .slice(0, 5)
  })

  return portfolio
}

export default {
  learnKeywordPatterns,
  recommendKeywordsByPattern,
  expandSemanticKeywords,
  reverseEngineerCompetitors,
  predictKeywordTrend,
  detectViralKeywords,
  calculateOpportunityScore,
  optimizeKeywordPortfolio,
}
