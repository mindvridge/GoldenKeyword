/**
 * Rate Limiter 미들웨어
 * API 호출 제한
 */

import rateLimit from 'express-rate-limit'

// API 호출 제한: 15분당 최대 100회
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 요청 수
  message: {
    success: false,
    message: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
