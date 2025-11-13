/**
 * Golden Keyword Finder - Express Server
 * 황금 키워드 찾기 백엔드 API 서버
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import keywordRoutes from './routes/keywordRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// 미들웨어 설정
app.use(helmet()) // 보안 헤더 설정
app.use(cors()) // CORS 활성화
app.use(compression()) // 응답 압축
app.use(morgan('dev')) // 로깅
app.use(express.json()) // JSON 파싱
app.use(express.urlencoded({ extended: true }))

// Rate limiting (API 호출 제한)
app.use('/api', rateLimiter)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Golden Keyword Finder API is running',
    timestamp: new Date().toISOString(),
  })
})

// API 라우트
app.use('/api/keywords', keywordRoutes)

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.',
  })
})

// 에러 핸들러
app.use(errorHandler)

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`)
})

export default app
