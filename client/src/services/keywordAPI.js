/**
 * 키워드 API 서비스
 * 백엔드 API와 통신하는 함수들
 */

import axios from 'axios'

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 키워드 검색 및 분석
 *
 * @param {Object} params - 검색 파라미터
 * @param {string} params.keyword - 시드 키워드
 * @param {number} params.minVolume - 최소 검색량
 * @param {number} params.maxDifficulty - 최대 난이도
 * @param {string} params.location - 국가 코드 (예: KR, US)
 * @param {string} params.language - 언어 코드 (예: ko, en)
 * @returns {Promise<Object>} 키워드 데이터
 */
export const searchKeywords = async (params) => {
  try {
    const response = await api.post('/keywords/search', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '키워드 검색에 실패했습니다.')
  }
}

/**
 * 네이버 키워드 검색
 *
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<Object>} 네이버 키워드 데이터
 */
export const searchNaverKeywords = async (keyword) => {
  try {
    const response = await api.post('/keywords/naver', { keyword })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '네이버 키워드 검색에 실패했습니다.')
  }
}

/**
 * 저장된 키워드 조회
 *
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 저장된 키워드 목록
 */
export const getSavedKeywords = async (userId) => {
  try {
    const response = await api.get('/keywords/saved', {
      params: { userId },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '저장된 키워드 조회에 실패했습니다.')
  }
}

/**
 * 키워드 저장
 *
 * @param {Object} keywordData - 저장할 키워드 데이터
 * @returns {Promise<Object>} 저장 결과
 */
export const saveKeyword = async (keywordData) => {
  try {
    const response = await api.post('/keywords/save', keywordData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '키워드 저장에 실패했습니다.')
  }
}

/**
 * 키워드 삭제
 *
 * @param {number} keywordId - 키워드 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteKeyword = async (keywordId) => {
  try {
    const response = await api.delete(`/keywords/${keywordId}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '키워드 삭제에 실패했습니다.')
  }
}

export default api
