# 기여 가이드

황금 키워드 찾기 프로젝트에 기여해주셔서 감사합니다!

## 시작하기

### 1. 저장소 포크
GitHub에서 이 저장소를 포크하세요.

### 2. 클론
```bash
git clone https://github.com/your-username/GoldenKeyword.git
cd GoldenKeyword
```

### 3. 의존성 설치
```bash
npm run install:all
```

### 4. 개발 서버 실행
```bash
npm run dev
```

## 개발 워크플로우

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 새 기능
- `fix/*`: 버그 수정
- `docs/*`: 문서 업데이트

### 새 기능 개발
```bash
git checkout -b feature/your-feature-name
# 코드 작성
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

### 커밋 메시지 규칙
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드, 설정 변경
```

## 코드 스타일

### JavaScript/React
- ESLint 규칙 준수
- Prettier 자동 포맷팅
- 함수형 컴포넌트 사용
- Hooks 사용

### 네이밍 규칙
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 파일명: PascalCase (컴포넌트), camelCase (유틸리티)

## 테스트

### 테스트 실행
```bash
npm test
```

### 테스트 작성
- 모든 새 기능에 테스트 작성
- 커버리지 80% 이상 유지

## Pull Request

### PR 체크리스트
- [ ] 코드가 정상적으로 빌드됨
- [ ] 테스트가 모두 통과함
- [ ] 코드 스타일이 일관적임
- [ ] 문서가 업데이트됨
- [ ] 커밋 메시지가 규칙을 따름

### PR 템플릿
```markdown
## 변경 사항
-

## 관련 이슈
Closes #

## 스크린샷 (UI 변경 시)

## 테스트
- [ ] 테스트 추가/수정
- [ ] 모든 테스트 통과
```

## 문의

궁금한 점이 있으면 이슈를 열어주세요!
