/**
 * 키워드 서비스
 * 키워드 저장 및 조회 비즈니스 로직
 */

import { query } from '../config/database.js'

/**
 * 저장된 키워드 조회
 *
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 저장된 키워드 목록
 */
export const getSavedKeywords = async (userId) => {
  try {
    const result = await query(
      `SELECT * FROM saved_keywords
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )

    return result.rows
  } catch (error) {
    console.error('Get saved keywords error:', error)
    throw new Error('저장된 키워드 조회에 실패했습니다.')
  }
}

/**
 * 키워드 저장
 *
 * @param {Object} keywordData - 키워드 데이터
 * @returns {Promise<Object>} 저장된 키워드
 */
export const saveKeyword = async (keywordData) => {
  const { userId, keyword, searchVolume, difficulty, cpc, notes } = keywordData

  try {
    const result = await query(
      `INSERT INTO saved_keywords (user_id, keyword, search_volume, difficulty, cpc, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, keyword)
       DO UPDATE SET
         search_volume = EXCLUDED.search_volume,
         difficulty = EXCLUDED.difficulty,
         cpc = EXCLUDED.cpc,
         notes = EXCLUDED.notes,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, keyword, searchVolume, difficulty, cpc, notes || null]
    )

    return result.rows[0]
  } catch (error) {
    console.error('Save keyword error:', error)
    throw new Error('키워드 저장에 실패했습니다.')
  }
}

/**
 * 키워드 삭제
 *
 * @param {number} keywordId - 키워드 ID
 * @returns {Promise<void>}
 */
export const deleteKeyword = async (keywordId) => {
  try {
    await query('DELETE FROM saved_keywords WHERE id = $1', [keywordId])
  } catch (error) {
    console.error('Delete keyword error:', error)
    throw new Error('키워드 삭제에 실패했습니다.')
  }
}

/**
 * 키워드 메트릭 저장 (히스토리 추적용)
 *
 * @param {Object} metric - 키워드 메트릭
 * @returns {Promise<Object>} 저장된 메트릭
 */
export const saveKeywordMetric = async (metric) => {
  const { keyword, searchVolume, cpc, competition, difficulty, kgr, kei } = metric

  try {
    const result = await query(
      `INSERT INTO keyword_metrics
       (keyword_text, search_volume, cpc, competition, difficulty, kgr, kei)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [keyword, searchVolume, cpc, competition, difficulty, kgr, kei]
    )

    return result.rows[0]
  } catch (error) {
    console.error('Save keyword metric error:', error)
    throw new Error('키워드 메트릭 저장에 실패했습니다.')
  }
}

export default {
  getSavedKeywords,
  saveKeyword,
  deleteKeyword,
  saveKeywordMetric,
}
