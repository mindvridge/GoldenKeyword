/**
 * PostgreSQL 데이터베이스 설정
 */

import pg from 'pg'
const { Pool } = pg

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully')
})

pool.on('error', (err) => {
  console.error('PostgreSQL error:', err)
})

/**
 * 데이터베이스 쿼리 실행
 *
 * @param {string} text - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Object>} 쿼리 결과
 */
export const query = (text, params) => pool.query(text, params)

/**
 * 데이터베이스 초기화
 * 테이블 생성
 */
export const initDatabase = async () => {
  try {
    // keyword_metrics 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS keyword_metrics (
        keyword_id SERIAL PRIMARY KEY,
        keyword_text VARCHAR(255) NOT NULL,
        search_volume INTEGER,
        cpc DECIMAL(10,2),
        competition DECIMAL(5,4),
        difficulty INTEGER,
        kgr DECIMAL(5,4),
        kei INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // saved_keywords 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_keywords (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        search_volume INTEGER,
        difficulty INTEGER,
        cpc DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, keyword)
      );
    `)

    // 인덱스 생성
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_keyword_text ON keyword_metrics(keyword_text);
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_keywords ON saved_keywords(user_id);
    `)

    console.log('✅ Database tables initialized')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// 앱 시작 시 데이터베이스 초기화
if (process.env.DATABASE_URL) {
  initDatabase()
} else {
  console.warn('⚠️  DATABASE_URL not configured. Database features disabled.')
}

export default pool
