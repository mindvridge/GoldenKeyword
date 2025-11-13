/**
 * 에러 핸들러 미들웨어
 * 전역 에러 처리
 */

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  const statusCode = err.statusCode || 500
  const message = err.message || '서버 오류가 발생했습니다.'

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
