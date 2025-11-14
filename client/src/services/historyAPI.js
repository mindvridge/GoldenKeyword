/**
 * 히스토리 API 서비스
 * 키워드 히스토리 조회 및 분석
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 키워드 히스토리 조회
 *
 * @param {string} keyword - 키워드
 * @param {number} days - 조회 기간 (일)
 * @returns {Promise<Object>} 히스토리 데이터
 */
export const getKeywordHistory = async (keyword, days = 90) => {
  try {
    const response = await api.get(`/advanced/history/${encodeURIComponent(keyword)}`, {
      params: { days },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '히스토리 조회에 실패했습니다.')
  }
}

/**
 * 최근 분석 키워드 목록
 *
 * @param {number} limit - 조회 개수
 * @returns {Promise<Object>} 최근 키워드
 */
export const getRecentKeywords = async (limit = 50) => {
  try {
    const response = await api.get('/advanced/history/recent/list', {
      params: { limit },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '최근 키워드 조회에 실패했습니다.')
  }
}

/**
 * 키워드 트렌드 변화 분석
 *
 * @param {string} keyword - 키워드
 * @returns {Promise<Object>} 트렌드 변화 데이터
 */
export const getTrendChange = async (keyword) => {
  try {
    const response = await api.get(`/advanced/history/trend-change/${encodeURIComponent(keyword)}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '트렌드 변화 분석에 실패했습니다.')
  }
}

/**
 * 키워드 성과 통계
 *
 * @returns {Promise<Object>} 통계 데이터
 */
export const getKeywordStats = async () => {
  try {
    const response = await api.get('/advanced/stats')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '통계 조회에 실패했습니다.')
  }
}

/**
 * 상위 성과 키워드
 *
 * @param {number} limit - 조회 개수
 * @returns {Promise<Object>} 상위 키워드
 */
export const getTopPerforming = async (limit = 10) => {
  try {
    const response = await api.get('/advanced/top-performing', {
      params: { limit },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '상위 키워드 조회에 실패했습니다.')
  }
}

/**
 * 검색 빈도 높은 키워드
 *
 * @param {number} limit - 조회 개수
 * @returns {Promise<Object>} 검색 빈도 키워드
 */
export const getMostSearched = async (limit = 10) => {
  try {
    const response = await api.get('/advanced/most-searched', {
      params: { limit },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '검색 빈도 조회에 실패했습니다.')
  }
}

/**
 * 일별 검색 통계
 *
 * @returns {Promise<Object>} 일별 통계
 */
export const getDailyStats = async () => {
  try {
    const response = await api.get('/advanced/daily-stats')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '일별 통계 조회에 실패했습니다.')
  }
}

export default {
  getKeywordHistory,
  getRecentKeywords,
  getTrendChange,
  getKeywordStats,
  getTopPerforming,
  getMostSearched,
  getDailyStats,
}
