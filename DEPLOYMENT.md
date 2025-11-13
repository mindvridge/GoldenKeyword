# 배포 가이드

황금 키워드 찾기 애플리케이션의 프로덕션 배포 가이드입니다.

## 배포 아키텍처

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Vercel    │ ───▶ │   Railway    │ ───▶ │ PostgreSQL  │
│ (Frontend)  │      │  (Backend)   │      │   (AWS RDS) │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │    Redis    │
                     │   (Cloud)   │
                     └─────────────┘
```

## 1. 프론트엔드 배포 (Vercel)

### 사전 준비
- Vercel 계정 생성: https://vercel.com
- Git 저장소 연결

### 배포 단계

#### 1.1 Vercel CLI 설치
```bash
npm install -g vercel
```

#### 1.2 프로젝트 빌드 테스트
```bash
cd client
npm run build
```

#### 1.3 Vercel 배포
```bash
vercel login
vercel
```

#### 1.4 환경 변수 설정
Vercel 대시보드 > Settings > Environment Variables:
```
VITE_API_URL=https://your-backend.railway.app/api
```

#### 1.5 자동 배포 설정
- GitHub/GitLab 연동
- main 브랜치 푸시 시 자동 배포

### 프로덕션 URL
```
https://golden-keyword-finder.vercel.app
```

## 2. 백엔드 배포 (Railway)

### 사전 준비
- Railway 계정 생성: https://railway.app
- GitHub 저장소 연결

### 배포 단계

#### 2.1 Railway CLI 설치
```bash
npm install -g @railway/cli
```

#### 2.2 Railway 로그인
```bash
railway login
```

#### 2.3 프로젝트 생성
```bash
cd server
railway init
```

#### 2.4 환경 변수 설정
Railway 대시보드 > Variables:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
DATAFORSEO_LOGIN=your_login
DATAFORSEO_PASSWORD=your_password
NAVER_CLIENT_ID=your_id
NAVER_CLIENT_SECRET=your_secret
```

#### 2.5 배포
```bash
railway up
```

### 프로덕션 URL
```
https://golden-keyword-api.railway.app
```

## 3. 데이터베이스 배포 (AWS RDS PostgreSQL)

### 사전 준비
- AWS 계정 생성
- RDS 접근 권한

### 배포 단계

#### 3.1 RDS 인스턴스 생성
1. AWS Console > RDS > Create database
2. Engine: PostgreSQL 15
3. Templates: Free tier (개발용) 또는 Production
4. DB instance identifier: golden-keyword-db
5. Master username: postgres
6. Master password: (안전한 비밀번호)
7. Public access: Yes (보안 그룹 설정 필수)

#### 3.2 보안 그룹 설정
- Inbound rules:
  - Type: PostgreSQL
  - Port: 5432
  - Source: Railway IP 주소 또는 0.0.0.0/0 (개발용)

#### 3.3 데이터베이스 초기화
```bash
# PostgreSQL 클라이언트 설치
sudo apt-get install postgresql-client

# 데이터베이스 연결
psql -h <rds-endpoint> -U postgres -d postgres

# 데이터베이스 생성
CREATE DATABASE golden_keyword;

# 스키마 생성
\c golden_keyword
\i schema.sql
```

#### 3.4 DATABASE_URL 설정
```
postgresql://postgres:password@your-rds-endpoint:5432/golden_keyword
```

### 대안: Railway PostgreSQL
Railway에서 PostgreSQL 플러그인 추가:
```bash
railway add postgresql
```

## 4. Redis 배포 (Redis Cloud)

### 사전 준비
- Redis Cloud 계정 생성: https://redis.com/cloud

### 배포 단계

#### 4.1 데이터베이스 생성
1. Redis Cloud Console
2. Create subscription
3. Fixed plan (30MB Free)
4. Cloud provider: AWS
5. Region: 백엔드와 가까운 리전 선택

#### 4.2 연결 정보 획득
- Endpoint: redis-xxxxx.redis.cloud:xxxxx
- Password: (자동 생성)

#### 4.3 REDIS_URL 설정
```
redis://:password@redis-xxxxx.redis.cloud:xxxxx
```

### 대안: Railway Redis
Railway에서 Redis 플러그인 추가:
```bash
railway add redis
```

## 5. 모니터링 및 로깅

### Vercel
- Vercel Analytics
- Real-time logs
- Error tracking

### Railway
- Railway Logs
- Metrics dashboard
- Alerts

### 추가 도구
- Sentry (에러 추적)
- LogRocket (사용자 세션 기록)
- Google Analytics

## 6. CI/CD 파이프라인

### GitHub Actions 예시

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 7. 성능 최적화

### 프론트엔드
- Vite 빌드 최적화
- Code splitting
- Image optimization
- CDN 활용

### 백엔드
- PM2 프로세스 관리
- Redis 캐싱 전략
- Database connection pooling
- Rate limiting

### 데이터베이스
- 인덱스 최적화
- Query 최적화
- Connection pooling
- Read replicas (고급)

## 8. 보안 체크리스트

- [ ] HTTPS 강제
- [ ] 환경 변수 암호화
- [ ] CORS 설정
- [ ] Rate limiting
- [ ] SQL Injection 방어
- [ ] XSS 방어
- [ ] CSRF 토큰
- [ ] API 키 보호
- [ ] 정기적인 의존성 업데이트
- [ ] 보안 헤더 (Helmet.js)

## 9. 백업 전략

### 데이터베이스
- AWS RDS 자동 백업 활성화
- Daily snapshots
- Point-in-time recovery

### Redis
- Redis persistence (AOF/RDB)
- Backup schedules

## 10. 비용 예상

### Free Tier
- Vercel: 무료 (Hobby plan)
- Railway: $5/월 (500시간/월)
- PostgreSQL (Railway): 무료 (512MB)
- Redis Cloud: 무료 (30MB)
- **총: ~$5/월**

### Production
- Vercel Pro: $20/월
- Railway Pro: $20/월
- AWS RDS (t3.micro): $15/월
- Redis Cloud (1GB): $10/월
- **총: ~$65/월**

### Scale Up
- Vercel Enterprise: Custom
- Railway: $100/월
- AWS RDS (t3.medium): $60/월
- Redis Cloud (5GB): $40/월
- DataForSEO API: $50-500/월
- **총: ~$250-700/월**

## 11. 트러블슈팅

### 일반적인 문제

#### CORS 에러
```javascript
// server/src/index.js
app.use(cors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
}))
```

#### 데이터베이스 연결 실패
- 보안 그룹 설정 확인
- DATABASE_URL 형식 확인
- SSL 설정 확인

#### Redis 연결 실패
- REDIS_URL 형식 확인
- 방화벽 설정 확인

## 12. 롤백 전략

### Vercel
```bash
vercel rollback
```

### Railway
```bash
railway rollback
```

### 데이터베이스
- RDS 스냅샷 복원
- Point-in-time recovery

## 지원

배포 관련 문제는 GitHub Issues로 문의해주세요.

---

**Happy Deploying!** 🚀
