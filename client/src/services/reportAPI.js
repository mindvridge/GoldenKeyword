import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60초 타임아웃 (리포트 생성은 시간이 걸릴 수 있음)
})

/**
 * 전체 성과 리포트 생성
 * @param {Object} options - { startDate, endDate, includeRecommendations }
 * @returns {Promise} 리포트 데이터
 */
export const generatePerformanceReport = async (options = {}) => {
  const response = await api.post('/reports/performance', options)
  return response.data
}

/**
 * 리포트 요약 생성
 * @param {Object} options - { startDate, endDate }
 * @returns {Promise} 요약 데이터
 */
export const generateReportSummary = async (options = {}) => {
  const response = await api.post('/reports/summary', options)
  return response.data
}

/**
 * 빠른 성과 요약 (최근 7일)
 * @returns {Promise} 요약 데이터
 */
export const getQuickReport = async () => {
  const response = await api.get('/reports/quick')
  return response.data
}

export default {
  generatePerformanceReport,
  generateReportSummary,
  getQuickReport,
}
