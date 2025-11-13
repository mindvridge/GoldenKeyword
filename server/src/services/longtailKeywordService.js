/**
 * 롱테일 키워드 생성 서비스
 * 3-4단어 이상의 구체적인 키워드 생성
 */

/**
 * 롱테일 키워드 생성기
 * 시드 키워드를 기반으로 다양한 롱테일 변형 생성
 */
export const generateLongtailKeywords = (seedKeyword) => {
  const longtails = []

  // 1. 질문형 키워드 (매우 효과적!)
  const questionWords = {
    ko: ['어떻게', '왜', '무엇', '어디서', '언제', '누가'],
    en: ['how to', 'why', 'what', 'where', 'when', 'who'],
  }

  const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(seedKeyword)
  const questions = isKorean ? questionWords.ko : questionWords.en

  questions.forEach((q) => {
    if (isKorean) {
      longtails.push(`${seedKeyword} ${q}`)
      longtails.push(`${q} ${seedKeyword}`)
    } else {
      longtails.push(`${q} ${seedKeyword}`)
    }
  })

  // 2. 수식어 추가
  const modifiers = {
    ko: {
      quality: ['최고의', '좋은', '인기', '추천', '베스트'],
      price: ['저렴한', '가성비', '할인', '무료', '저가'],
      time: ['빠른', '즉시', '24시간', '당일'],
      target: ['초보자', '입문자', '전문가', '학생', '직장인'],
      comparison: ['비교', 'vs', '차이', '장단점'],
    },
    en: {
      quality: ['best', 'top', 'good', 'popular', 'recommended'],
      price: ['cheap', 'affordable', 'discount', 'free', 'budget'],
      time: ['quick', 'fast', 'instant', 'today'],
      target: ['beginner', 'starter', 'professional', 'student'],
      comparison: ['vs', 'comparison', 'difference', 'review'],
    },
  }

  const mods = isKorean ? modifiers.ko : modifiers.en

  Object.values(mods)
    .flat()
    .forEach((mod) => {
      if (isKorean) {
        longtails.push(`${mod} ${seedKeyword}`)
      } else {
        longtails.push(`${mod} ${seedKeyword}`)
        longtails.push(`${seedKeyword} ${mod}`)
      }
    })

  // 3. 용도/목적 추가
  const purposes = {
    ko: ['방법', '사용법', '가이드', '팁', '추천', '후기', '리뷰', '비교'],
    en: ['guide', 'tutorial', 'tips', 'review', 'comparison', 'how to use'],
  }

  const purps = isKorean ? purposes.ko : purposes.en
  purps.forEach((purpose) => {
    if (isKorean) {
      longtails.push(`${seedKeyword} ${purpose}`)
    } else {
      longtails.push(`${seedKeyword} ${purpose}`)
    }
  })

  // 4. 장소/위치 추가 (로컬 SEO)
  if (isKorean) {
    const locations = ['서울', '부산', '대구', '인천', '광주', '대전', '강남', '홍대']
    locations.forEach((loc) => {
      longtails.push(`${loc} ${seedKeyword}`)
      longtails.push(`${seedKeyword} ${loc}`)
    })
  }

  // 5. 연도 추가 (최신성)
  const currentYear = new Date().getFullYear()
  longtails.push(`${seedKeyword} ${currentYear}`)
  longtails.push(`${seedKeyword} ${currentYear + 1}`)

  // 6. 문제 해결형
  const problems = {
    ko: ['문제', '오류', '해결', '고치는법', '안될때'],
    en: ['problem', 'error', 'solution', 'fix', 'troubleshoot'],
  }

  const probs = isKorean ? problems.ko : problems.en
  probs.forEach((prob) => {
    if (isKorean) {
      longtails.push(`${seedKeyword} ${prob}`)
    } else {
      longtails.push(`${seedKeyword} ${prob}`)
    }
  })

  // 7. 거래성 키워드 (수익화)
  const commercial = {
    ko: ['구매', '가격', '할인', '쿠폰', '최저가', '판매처', '파는곳'],
    en: ['buy', 'price', 'discount', 'coupon', 'deal', 'sale', 'where to buy'],
  }

  const comms = isKorean ? commercial.ko : commercial.en
  comms.forEach((comm) => {
    if (isKorean) {
      longtails.push(`${seedKeyword} ${comm}`)
    } else {
      longtails.push(`${seedKeyword} ${comm}`)
    }
  })

  // 중복 제거
  return [...new Set(longtails)]
}

/**
 * PAA (People Also Ask) 스타일 질문 생성
 */
export const generatePAAQuestions = (seedKeyword) => {
  const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(seedKeyword)

  const templates = {
    ko: [
      `${seedKeyword}란 무엇인가요?`,
      `${seedKeyword} 어떻게 하나요?`,
      `${seedKeyword} 왜 필요한가요?`,
      `${seedKeyword} 언제 사용하나요?`,
      `${seedKeyword} 어디서 구매하나요?`,
      `${seedKeyword} 얼마나 걸리나요?`,
      `${seedKeyword} 얼마인가요?`,
      `${seedKeyword} 효과가 있나요?`,
      `${seedKeyword} 안전한가요?`,
      `${seedKeyword} 부작용은 무엇인가요?`,
      `${seedKeyword} 추천 제품은?`,
      `${seedKeyword} 비교 어떤게 좋나요?`,
    ],
    en: [
      `What is ${seedKeyword}?`,
      `How to use ${seedKeyword}?`,
      `Why do I need ${seedKeyword}?`,
      `When to use ${seedKeyword}?`,
      `Where to buy ${seedKeyword}?`,
      `How long does ${seedKeyword} take?`,
      `How much does ${seedKeyword} cost?`,
      `Does ${seedKeyword} work?`,
      `Is ${seedKeyword} safe?`,
      `What are ${seedKeyword} side effects?`,
      `Best ${seedKeyword} recommendations?`,
      `${seedKeyword} comparison - which is better?`,
    ],
  }

  return isKorean ? templates.ko : templates.en
}

/**
 * 키워드 클러스터링
 * 관련 키워드를 주제별로 그룹화
 */
export const clusterKeywords = (keywords) => {
  const clusters = {
    informational: [],
    transactional: [],
    navigational: [],
    local: [],
    comparison: [],
    question: [],
  }

  keywords.forEach((kw) => {
    const keyword = kw.keyword || kw

    // 정보성
    if (
      /방법|가이드|팁|튜토리얼|how|guide|tutorial|tip/i.test(keyword)
    ) {
      clusters.informational.push(keyword)
    }

    // 거래성
    if (
      /구매|가격|할인|buy|price|discount|sale/i.test(keyword)
    ) {
      clusters.transactional.push(keyword)
    }

    // 비교
    if (/비교|vs|차이|comparison|difference|better/i.test(keyword)) {
      clusters.comparison.push(keyword)
    }

    // 질문형
    if (
      /어떻게|왜|무엇|how|why|what|where|when|who|\?/i.test(keyword)
    ) {
      clusters.question.push(keyword)
    }

    // 로컬
    if (
      /서울|부산|대구|강남|seoul|busan|near me|local/i.test(keyword)
    ) {
      clusters.local.push(keyword)
    }

    // 기타는 navigational
    if (
      !clusters.informational.includes(keyword) &&
      !clusters.transactional.includes(keyword) &&
      !clusters.comparison.includes(keyword) &&
      !clusters.question.includes(keyword) &&
      !clusters.local.includes(keyword)
    ) {
      clusters.navigational.push(keyword)
    }
  })

  return clusters
}

/**
 * 키워드 우선순위 계산
 * 여러 지표를 종합하여 우선순위 점수 계산
 */
export const calculateKeywordPriority = (keywordData) => {
  const {
    kgr,
    searchVolume,
    cpc,
    serpDifficulty,
    trend,
    intent,
    isLongtail,
  } = keywordData

  let priority = 0

  // 1. KGR 점수 (최우선)
  if (kgr < 0.25) priority += 40
  else if (kgr < 0.5) priority += 30
  else if (kgr < 1.0) priority += 20
  else priority += 5

  // 2. 검색량 (적정 범위가 중요)
  if (searchVolume >= 100 && searchVolume <= 1000) priority += 25 // 스위트 스팟!
  else if (searchVolume > 1000 && searchVolume <= 5000) priority += 20
  else if (searchVolume > 5000) priority += 10
  else priority += 5

  // 3. 롱테일 보너스
  if (isLongtail) priority += 10

  // 4. 트렌드
  if (trend === 'rising') priority += 10
  else if (trend === 'stable') priority += 5

  // 5. SERP 난이도 (낮을수록 좋음)
  if (serpDifficulty < 30) priority += 10
  else if (serpDifficulty < 50) priority += 5

  // 6. 수익성 (CPC)
  if (cpc > 2) priority += 5

  return Math.min(100, priority)
}

/**
 * 콘텐츠 제작 우선순위 리스트 생성
 */
export const generateContentPriorityList = (keywords) => {
  // 우선순위 계산
  const keywordsWithPriority = keywords.map((kw) => ({
    ...kw,
    priority: calculateKeywordPriority(kw),
    wordCount: kw.keyword.split(' ').length,
    isLongtail: kw.keyword.split(' ').length >= 3,
  }))

  // 우선순위 내림차순 정렬
  const sorted = keywordsWithPriority.sort((a, b) => b.priority - a.priority)

  // Top 20 추출
  const top20 = sorted.slice(0, 20)

  return {
    topPriority: top20,
    quickWins: top20.filter((kw) => kw.kgr < 0.25 && kw.searchVolume >= 100), // 빠른 승리
    longtailGems: top20.filter((kw) => kw.isLongtail && kw.kgr < 0.5), // 롱테일 보석
    risingStars: top20.filter((kw) => kw.trend === 'rising'), // 떠오르는 별
    moneyMakers: top20.filter((kw) => kw.cpc > 2 && kw.kgr < 1.0), // 수익 창출
  }
}

export default {
  generateLongtailKeywords,
  generatePAAQuestions,
  clusterKeywords,
  calculateKeywordPriority,
  generateContentPriorityList,
}
