# 황금 키워드 찾기 (Golden Keyword Finder)

검색량은 많지만 경쟁도가 낮은 "황금 키워드"를 자동으로 찾아주는 웹 애플리케이션입니다. 구글 애드센스 수익화와 이커머스 제품 판매를 위한 키워드 발굴이 주 목적입니다.

## 주요 기능

### 키워드 분석 알고리즘
- **KGR (Keyword Golden Ratio)**: `Allintitle 검색 결과 수 / 월간 검색량`
  - KGR < 0.25: 황금 키워드 (매우 좋음)
  - KGR 0.25-1.0: 양호한 키워드
  - KGR > 1.0: 경쟁이 높은 키워드 (부적합)

- **KEI (Keyword Efficiency Index)**: `(검색량)² / 경쟁도`
  - 높을수록 좋은 기회
  - KEI > 100: 매우 좋은 키워드

### 핵심 기능
- 시드 키워드 입력 → 연관 키워드 자동 발굴
- KGR, KEI, 검색량, CPC, 난이도 실시간 계산
- 네이버/구글 동시 분석
- 고급 필터링 (검색량 범위, 난이도, CPC, 국가/언어)
- 데이터 시각화 (검색량 vs 난이도 차트, KGR 분포도, 산점도)
- CSV/Excel 내보내기
- 다크 모드 지원
- 반응형 디자인 (모바일 우선)

## 기술 스택

### 프론트엔드
- React 18
- Material-UI (MUI)
- TanStack Query (React Query)
- Recharts
- Vite

### 백엔드
- Node.js
- Express
- PostgreSQL
- Redis
- Axios

### API
- DataForSEO API
- Naver 검색광고 API
- Google Keyword Planner

## 프로젝트 구조

```
GoldenKeyword/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   │   ├── KeywordSearch/
│   │   │   ├── DataTable/
│   │   │   ├── Charts/
│   │   │   └── Dashboard/
│   │   ├── services/       # API 통신
│   │   ├── utils/          # 유틸리티 함수
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express 백엔드
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   ├── controllers/    # 컨트롤러
│   │   ├── services/       # 비즈니스 로직
│   │   ├── models/         # 데이터 모델
│   │   ├── config/         # 설정
│   │   ├── middleware/     # 미들웨어
│   │   └── utils/          # 유틸리티
│   └── package.json
│
├── package.json            # 루트 package.json (워크스페이스)
└── README.md
```

## 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd GoldenKeyword
```

### 2. 의존성 설치

```bash
# 루트 및 모든 워크스페이스 의존성 설치
npm run install:all
```

### 3. 환경 변수 설정

#### 프론트엔드 (.env)
```bash
cd client
cp .env.example .env
# .env 파일 편집
```

#### 백엔드 (.env)
```bash
cd server
cp .env.example .env
# .env 파일 편집
```

### 4. 데이터베이스 설정

#### PostgreSQL 설치 및 데이터베이스 생성
```bash
# PostgreSQL 설치 (Ubuntu/Debian)
sudo apt-get install postgresql

# 데이터베이스 생성
sudo -u postgres psql
CREATE DATABASE golden_keyword;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE golden_keyword TO your_username;
\q
```

#### Redis 설치 및 실행
```bash
# Redis 설치 (Ubuntu/Debian)
sudo apt-get install redis-server

# Redis 시작
sudo systemctl start redis
sudo systemctl enable redis
```

### 5. 애플리케이션 실행

#### 개발 모드 (프론트엔드 + 백엔드 동시 실행)
```bash
npm run dev
```

#### 프론트엔드만 실행
```bash
npm run client
```

#### 백엔드만 실행
```bash
npm run server
```

### 6. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## API 엔드포인트

### 키워드 검색
```
POST /api/keywords/search
Body: {
  keyword: string,
  minVolume: number,
  maxDifficulty: number,
  location: string,
  language: string
}
```

### 네이버 키워드 검색
```
POST /api/keywords/naver
Body: { keyword: string }
```

### 저장된 키워드 조회
```
GET /api/keywords/saved?userId=<userId>
```

### 키워드 저장
```
POST /api/keywords/save
Body: {
  userId: number,
  keyword: string,
  searchVolume: number,
  difficulty: number,
  cpc: number,
  notes: string
}
```

### 키워드 삭제
```
DELETE /api/keywords/:id
```

## API 키 발급 방법

### DataForSEO API
1. https://dataforseo.com 회원가입
2. API 크레딧 구매
3. 로그인 정보 (username, password) 획득
4. `.env`에 설정

### Naver 검색광고 API
1. https://searchad.naver.com 로그인
2. 도구 > API 관리 > 애플리케이션 등록
3. Client ID, Client Secret 발급
4. `.env`에 설정

## 배포

### 프론트엔드 (Vercel)
```bash
cd client
npm run build
vercel deploy
```

### 백엔드 (Railway/Heroku)
```bash
cd server
# Railway CLI
railway login
railway init
railway up

# 또는 Heroku
heroku login
heroku create
git push heroku main
```

### 데이터베이스
- AWS RDS PostgreSQL
- Railway PostgreSQL
- Heroku Postgres

### Redis
- Redis Cloud
- AWS ElastiCache
- Railway Redis

## 개발 가이드

### 새 컴포넌트 추가
```bash
cd client/src/components
mkdir NewComponent
touch NewComponent/NewComponent.jsx
```

### 새 API 엔드포인트 추가
1. `server/src/routes/` - 라우트 정의
2. `server/src/controllers/` - 컨트롤러 로직
3. `server/src/services/` - 비즈니스 로직

### 코드 스타일
- ESLint 사용
- Prettier 자동 포맷팅
- 컴포넌트: PascalCase
- 파일명: PascalCase (컴포넌트), camelCase (유틸리티)

## 성능 최적화

- Redis 다층 캐싱 (TTL: 1-2시간)
- TanStack Query 클라이언트 캐싱
- 디바운스 검색 (300ms)
- 가상 스크롤링 (큰 데이터셋)
- 코드 스플리팅
- 이미지 최적화

## 보안

- Helmet.js (보안 헤더)
- Rate Limiting (15분당 100회)
- CORS 설정
- 환경 변수 암호화
- SQL Injection 방어 (Parameterized Queries)
- XSS 방어 (React 기본 탈출)

## 라이센스

MIT License

## 기여

풀 리퀘스트와 이슈는 언제나 환영합니다!

## 문의

이슈를 통해 문의해주세요.

---

**Happy Keyword Hunting!** 🔍✨
