/**
 * 키워드 라우트
 * 키워드 검색, 저장, 조회 API 엔드포인트
 */

import express from 'express'
import {
  searchKeywords,
  searchNaverKeywords,
  getSavedKeywords,
  saveKeyword,
  deleteKeyword,
} from '../controllers/keywordController.js'

const router = express.Router()

// POST /api/keywords/search - 키워드 검색
router.post('/search', searchKeywords)

// POST /api/keywords/naver - 네이버 키워드 검색
router.post('/naver', searchNaverKeywords)

// GET /api/keywords/saved - 저장된 키워드 조회
router.get('/saved', getSavedKeywords)

// POST /api/keywords/save - 키워드 저장
router.post('/save', saveKeyword)

// DELETE /api/keywords/:id - 키워드 삭제
router.delete('/:id', deleteKeyword)

export default router
