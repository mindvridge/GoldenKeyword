/**
 * 키워드 컨트롤러
 * 키워드 검색 및 관리 비즈니스 로직
 */

import * as KeywordService from '../services/keywordService.js'
import * as NaverService from '../services/naverService.js'
import * as DataForSEOService from '../services/dataforSEOService.js'
import { getCachedData, setCachedData } from '../services/redisService.js'

/**
 * 키워드 검색
 * POST /api/keywords/search
 */
export const searchKeywords = async (req, res, next) => {
  try {
    const { keyword, minVolume, maxDifficulty, location, language } = req.body

    // 입력 검증
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '키워드를 입력해주세요.',
      })
    }

    // 캐시 키 생성
    const cacheKey = `keyword:${keyword}:${minVolume}:${maxDifficulty}:${location}`

    // Redis 캐시 확인
    const cachedData = await getCachedData(cacheKey)
    if (cachedData) {
      console.log('Cache hit:', cacheKey)
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // DataForSEO API로 키워드 데이터 조회
    const keywords = await DataForSEOService.searchKeywords({
      keyword,
      minVolume: minVolume || 100,
      maxDifficulty: maxDifficulty || 100,
      location: location || 'KR',
      language: language || 'ko',
    })

    // Redis에 캐싱 (1시간 TTL)
    await setCachedData(cacheKey, keywords, 3600)

    res.json({
      success: true,
      data: keywords,
      count: keywords.length,
      cached: false,
    })
  } catch (error) {
    console.error('Search keywords error:', error)
    next(error)
  }
}

/**
 * 네이버 키워드 검색
 * POST /api/keywords/naver
 */
export const searchNaverKeywords = async (req, res, next) => {
  try {
    const { keyword } = req.body

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '키워드를 입력해주세요.',
      })
    }

    // 캐시 키
    const cacheKey = `naver:${keyword}`

    // Redis 캐시 확인
    const cachedData = await getCachedData(cacheKey)
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // 네이버 API로 키워드 데이터 조회
    const keywords = await NaverService.searchKeywords(keyword)

    // Redis에 캐싱 (2시간 TTL)
    await setCachedData(cacheKey, keywords, 7200)

    res.json({
      success: true,
      data: keywords,
      cached: false,
    })
  } catch (error) {
    console.error('Naver search error:', error)
    next(error)
  }
}

/**
 * 저장된 키워드 조회
 * GET /api/keywords/saved
 */
export const getSavedKeywords = async (req, res, next) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID가 필요합니다.',
      })
    }

    const keywords = await KeywordService.getSavedKeywords(userId)

    res.json({
      success: true,
      data: keywords,
    })
  } catch (error) {
    console.error('Get saved keywords error:', error)
    next(error)
  }
}

/**
 * 키워드 저장
 * POST /api/keywords/save
 */
export const saveKeyword = async (req, res, next) => {
  try {
    const keywordData = req.body

    // 입력 검증
    if (!keywordData.keyword || !keywordData.userId) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.',
      })
    }

    const result = await KeywordService.saveKeyword(keywordData)

    res.status(201).json({
      success: true,
      data: result,
      message: '키워드가 저장되었습니다.',
    })
  } catch (error) {
    console.error('Save keyword error:', error)
    next(error)
  }
}

/**
 * 키워드 삭제
 * DELETE /api/keywords/:id
 */
export const deleteKeyword = async (req, res, next) => {
  try {
    const { id } = req.params

    await KeywordService.deleteKeyword(id)

    res.json({
      success: true,
      message: '키워드가 삭제되었습니다.',
    })
  } catch (error) {
    console.error('Delete keyword error:', error)
    next(error)
  }
}
