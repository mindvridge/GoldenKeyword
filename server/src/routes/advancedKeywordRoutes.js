/**
 * 고급 키워드 분석 라우트
 */

import express from 'express'
import * as AdvancedKeywordService from '../services/advancedKeywordService.js'
import * as LongtailService from '../services/longtailKeywordService.js'
import * as AIService from '../services/aiKeywordService.js'

const router = express.Router()

/**
 * POST /api/advanced/analyze
 * 단일 키워드 심층 분석
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { keyword, location, language } = req.body

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '키워드를 입력해주세요.',
      })
    }

    // 고급 분석 실행
    const analysis = await AdvancedKeywordService.advancedKeywordAnalysis(
      keyword,
      { location, language }
    )

    if (!analysis) {
      return res.status(500).json({
        success: false,
        message: '키워드 분석에 실패했습니다. API 설정을 확인해주세요.',
      })
    }

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error('Advanced analysis error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/longtail
 * 롱테일 키워드 생성
 */
router.post('/longtail', async (req, res, next) => {
  try {
    const { keyword } = req.body

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '시드 키워드를 입력해주세요.',
      })
    }

    // 롱테일 키워드 생성
    const longtails = LongtailService.generateLongtailKeywords(keyword)

    // PAA 질문 생성
    const paaQuestions = LongtailService.generatePAAQuestions(keyword)

    res.json({
      success: true,
      data: {
        longtails,
        paaQuestions,
        count: longtails.length,
      },
    })
  } catch (error) {
    console.error('Longtail generation error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/cluster
 * 키워드 클러스터링
 */
router.post('/cluster', async (req, res, next) => {
  try {
    const { keywords } = req.body

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        message: '키워드 배열을 제공해주세요.',
      })
    }

    // 클러스터링
    const clusters = LongtailService.clusterKeywords(keywords)

    res.json({
      success: true,
      data: clusters,
    })
  } catch (error) {
    console.error('Clustering error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/priority
 * 콘텐츠 제작 우선순위 리스트
 */
router.post('/priority', async (req, res, next) => {
  try {
    const { keywords } = req.body

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        message: '키워드 데이터를 제공해주세요.',
      })
    }

    // 우선순위 리스트 생성
    const priorityList =
      LongtailService.generateContentPriorityList(keywords)

    res.json({
      success: true,
      data: priorityList,
    })
  } catch (error) {
    console.error('Priority list error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/ai-recommend
 * AI 기반 키워드 추천
 */
router.post('/ai-recommend', async (req, res, next) => {
  try {
    const { successfulKeywords, candidateKeywords } = req.body

    if (
      !successfulKeywords ||
      !candidateKeywords ||
      !Array.isArray(successfulKeywords) ||
      !Array.isArray(candidateKeywords)
    ) {
      return res.status(400).json({
        success: false,
        message: '성공 키워드와 후보 키워드를 제공해주세요.',
      })
    }

    // 패턴 학습
    const patterns = AIService.learnKeywordPatterns(successfulKeywords)

    // 패턴 기반 추천
    const recommendations = AIService.recommendKeywordsByPattern(
      candidateKeywords,
      patterns
    )

    res.json({
      success: true,
      data: {
        recommendations,
        patterns,
      },
    })
  } catch (error) {
    console.error('AI recommendation error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/semantic-expand
 * 시맨틱 키워드 확장
 */
router.post('/semantic-expand', async (req, res, next) => {
  try {
    const { keyword } = req.body

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '시드 키워드를 입력해주세요.',
      })
    }

    // 시맨틱 확장
    const expanded = AIService.expandSemanticKeywords(keyword)

    res.json({
      success: true,
      data: {
        original: keyword,
        expanded,
        count: expanded.length,
      },
    })
  } catch (error) {
    console.error('Semantic expansion error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/trend-predict
 * 트렌드 예측
 */
router.post('/trend-predict', async (req, res, next) => {
  try {
    const { historicalData } = req.body

    if (!historicalData || !Array.isArray(historicalData)) {
      return res.status(400).json({
        success: false,
        message: '과거 데이터를 제공해주세요.',
      })
    }

    // 트렌드 예측
    const prediction = AIService.predictKeywordTrend(historicalData)

    res.json({
      success: true,
      data: prediction,
    })
  } catch (error) {
    console.error('Trend prediction error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/portfolio
 * 키워드 포트폴리오 최적화
 */
router.post('/portfolio', async (req, res, next) => {
  try {
    const { keywords } = req.body

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        message: '키워드 데이터를 제공해주세요.',
      })
    }

    // 포트폴리오 최적화
    const portfolio = AIService.optimizeKeywordPortfolio(keywords)

    res.json({
      success: true,
      data: portfolio,
    })
  } catch (error) {
    console.error('Portfolio optimization error:', error)
    next(error)
  }
})

/**
 * POST /api/advanced/opportunity-score
 * 기회 점수 계산
 */
router.post('/opportunity-score', async (req, res, next) => {
  try {
    const { keywords } = req.body

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        message: '키워드 데이터를 제공해주세요.',
      })
    }

    // 각 키워드의 기회 점수 계산
    const withScores = keywords.map((kw) => ({
      ...kw,
      opportunityScore: AIService.calculateOpportunityScore(kw),
    }))

    // 점수 기준 정렬
    const sorted = withScores.sort(
      (a, b) => b.opportunityScore - a.opportunityScore
    )

    res.json({
      success: true,
      data: sorted,
    })
  } catch (error) {
    console.error('Opportunity score error:', error)
    next(error)
  }
})

export default router
