/**
 * 고급 키워드 API 서비스
 * 실제 allintitle, SERP 분석, 롱테일 생성 등 고급 기능
 */

import axios from 'axios'

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // 60초 (고급 분석은 시간이 더 걸림)
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
 * 고급 키워드 분석 (실제 allintitle, SERP 분석)
 *
 * @param {Object} params - 분석 파라미터
 * @param {string} params.keyword - 키워드
 * @param {string} params.location - 국가 코드
 * @param {string} params.language - 언어 코드
 * @returns {Promise<Object>} 분석 결과
 */
export const advancedAnalyze = async (params) => {
  try {
    const response = await api.post('/advanced/analyze', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '고급 분석에 실패했습니다.')
  }
}

/**
 * 롱테일 키워드 생성
 *
 * @param {Object} params - 파라미터
 * @param {string} params.keyword - 시드 키워드
 * @returns {Promise<Object>} 롱테일 키워드 목록
 */
export const generateLongtail = async (params) => {
  try {
    const response = await api.post('/advanced/longtail', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '롱테일 생성에 실패했습니다.')
  }
}

/**
 * 키워드 클러스터링
 *
 * @param {Object} params - 파라미터
 * @param {Array} params.keywords - 키워드 목록
 * @returns {Promise<Object>} 클러스터 결과
 */
export const clusterKeywords = async (params) => {
  try {
    const response = await api.post('/advanced/cluster', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '클러스터링에 실패했습니다.')
  }
}

/**
 * 콘텐츠 제작 우선순위 리스트
 *
 * @param {Object} params - 파라미터
 * @param {Array} params.keywords - 키워드 데이터
 * @returns {Promise<Object>} 우선순위 리스트
 */
export const getPriorityList = async (params) => {
  try {
    const response = await api.post('/advanced/priority', params)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || '우선순위 리스트 생성에 실패했습니다.'
    )
  }
}

/**
 * AI 기반 키워드 추천
 *
 * @param {Object} params - 파라미터
 * @param {Array} params.successfulKeywords - 성공한 키워드
 * @param {Array} params.candidateKeywords - 후보 키워드
 * @returns {Promise<Object>} 추천 결과
 */
export const getAIRecommendations = async (params) => {
  try {
    const response = await api.post('/advanced/ai-recommend', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'AI 추천에 실패했습니다.')
  }
}

/**
 * 시맨틱 키워드 확장
 *
 * @param {Object} params - 파라미터
 * @param {string} params.keyword - 시드 키워드
 * @returns {Promise<Object>} 확장된 키워드
 */
export const expandSemantic = async (params) => {
  try {
    const response = await api.post('/advanced/semantic-expand', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '시맨틱 확장에 실패했습니다.')
  }
}

/**
 * 트렌드 예측
 *
 * @param {Object} params - 파라미터
 * @param {Array} params.historicalData - 과거 데이터
 * @returns {Promise<Object>} 예측 결과
 */
export const predictTrend = async (params) => {
  try {
    const response = await api.post('/advanced/trend-predict', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '트렌드 예측에 실패했습니다.')
  }
}

/**
 * 키워드 포트폴리오 최적화
 *
 * @param {Object} params - 파라미터
 * @param {Array} params.keywords - 키워드 데이터
 * @returns {Promise<Object>} 포트폴리오
 */
export const optimizePortfolio = async (params) => {
  try {
    const response = await api.post('/advanced/portfolio', params)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || '포트폴리오 최적화에 실패했습니다.'
    )
  }
}

/**
 * 기회 점수 계산
 *
 * @param {Object} params - 파라미터
 * @param {Array} params.keywords - 키워드 데이터
 * @returns {Promise<Object>} 점수가 계산된 키워드
 */
export const calculateOpportunityScores = async (params) => {
  try {
    const response = await api.post('/advanced/opportunity-score', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || '기회 점수 계산에 실패했습니다.')
  }
}

export default {
  advancedAnalyze,
  generateLongtail,
  clusterKeywords,
  getPriorityList,
  getAIRecommendations,
  expandSemantic,
  predictTrend,
  optimizePortfolio,
  calculateOpportunityScores,
}
