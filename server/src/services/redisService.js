/**
 * Redis 캐싱 서비스
 * 키워드 데이터 캐싱
 */

import { createClient } from 'redis'

let redisClient = null

/**
 * Redis 클라이언트 초기화
 */
export const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  try {
    redisClient = createClient({
      url: redisUrl,
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    await redisClient.connect()
    console.log('✅ Redis connected successfully')
  } catch (error) {
    console.warn('⚠️  Redis connection failed. Caching disabled.', error.message)
    redisClient = null
  }
}

/**
 * 캐시 데이터 조회
 *
 * @param {string} key - 캐시 키
 * @returns {Promise<any>} 캐시된 데이터
 */
export const getCachedData = async (key) => {
  if (!redisClient || !redisClient.isOpen) {
    return null
  }

  try {
    const data = await redisClient.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

/**
 * 캐시 데이터 저장
 *
 * @param {string} key - 캐시 키
 * @param {any} data - 저장할 데이터
 * @param {number} ttl - TTL (초 단위, 기본: 3600초 = 1시간)
 */
export const setCachedData = async (key, data, ttl = 3600) => {
  if (!redisClient || !redisClient.isOpen) {
    return
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

/**
 * 캐시 삭제
 *
 * @param {string} key - 캐시 키
 */
export const deleteCachedData = async (key) => {
  if (!redisClient || !redisClient.isOpen) {
    return
  }

  try {
    await redisClient.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}

/**
 * Redis 연결 종료
 */
export const closeRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit()
    console.log('Redis connection closed')
  }
}

// 앱 시작 시 Redis 초기화
initRedis()

export default {
  getCachedData,
  setCachedData,
  deleteCachedData,
  closeRedis,
}
