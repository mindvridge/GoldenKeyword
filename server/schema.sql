-- 황금 키워드 찾기 데이터베이스 스키마
-- PostgreSQL

-- 키워드 메트릭 테이블
CREATE TABLE IF NOT EXISTS keyword_metrics (
  keyword_id SERIAL PRIMARY KEY,
  keyword_text VARCHAR(255) NOT NULL,
  search_volume INTEGER,
  cpc DECIMAL(10,2),
  competition DECIMAL(5,4),
  difficulty INTEGER,
  kgr DECIMAL(5,4),
  kei INTEGER,
  allintitle INTEGER,              -- 실제 allintitle 검색 결과 수
  serp_difficulty INTEGER,         -- SERP 난이도 (0-100)
  trend VARCHAR(50),                -- 트렌드 (rising, stable, declining)
  intent VARCHAR(50),               -- 키워드 의도 (informational, transactional, navigational)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 저장된 키워드 테이블 (사용자별)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_keyword_text ON keyword_metrics(keyword_text);
CREATE INDEX IF NOT EXISTS idx_user_keywords ON saved_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON keyword_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kgr ON keyword_metrics(kgr ASC);  -- KGR 낮은 순 조회 최적화
CREATE INDEX IF NOT EXISTS idx_keyword_created ON keyword_metrics(keyword_text, created_at DESC);  -- 히스토리 조회 최적화

-- 샘플 데이터 (선택사항)
-- INSERT INTO saved_keywords (user_id, keyword, search_volume, difficulty, cpc, notes)
-- VALUES (1, '다이어트 추천', 5000, 45, 1.50, '황금 키워드 후보');

-- 통계 뷰 (선택사항)
CREATE OR REPLACE VIEW keyword_stats AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_keywords,
  AVG(search_volume) as avg_search_volume,
  AVG(kgr) as avg_kgr,
  AVG(kei) as avg_kei
FROM keyword_metrics
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
