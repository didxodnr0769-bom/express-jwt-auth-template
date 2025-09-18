# JWT Mock Server

프론트엔드 JWT 테스트를 위한 Express Mock 서버입니다.

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (선택사항)
# .env 파일을 생성하고 다음 내용을 추가하세요:
# JWT_SECRET=your-super-secret-jwt-key-here
# PORT=3000

# 서버 실행
npm start

# 개발 모드 (nodemon 사용)
npm run dev
```

## 테스트 실행

```bash
# 토큰 발급 테스트
npm run test:token

# 토큰 재발급 테스트
npm run test:refresh

# 모든 테스트 실행
npm run test:all
```

## Vercel 배포

### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

### 2. Vercel 로그인
```bash
vercel login
```

### 3. 프로젝트 배포
```bash
vercel
```

### 4. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `JWT_SECRET`: JWT 서명용 시크릿 키
- `PORT`: 포트 번호 (선택사항)

### 5. 자동 배포
GitHub 저장소와 연결하면 자동으로 배포됩니다.

## API 엔드포인트

### 1. 로그인 (토큰 발급)

```
POST /api/auth/login
Content-Type: application/json

{
  "id": "test",
  "password": "test"
}
```

**응답:**

```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "test",
      "name": "Test User"
    },
    "expiresIn": "5m"
  }
}
```

### 2. 토큰 갱신

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답:**

```json
{
  "success": true,
  "message": "토큰이 성공적으로 갱신되었습니다.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "5m"
  }
}
```

### 3. 토큰 검증

```
GET /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답:**

```json
{
  "success": true,
  "message": "토큰이 유효합니다.",
  "data": {
    "user": {
      "id": "test",
      "name": "Test User",
      "type": "access"
    },
    "tokenInfo": {
      "type": "access",
      "expiresIn": "5m"
    }
  }
}
```

## 토큰 설정

- **Access Token**: 5분 만료
- **Refresh Token**: 1일 만료

## 에러 코드

| 코드                              | 설명                        |
| --------------------------------- | --------------------------- |
| `MISSING_CREDENTIALS`             | 아이디 또는 비밀번호 누락   |
| `INVALID_CREDENTIALS`             | 잘못된 로그인 정보          |
| `MISSING_REFRESH_TOKEN`           | 리프레시 토큰 누락          |
| `REFRESH_TOKEN_EXPIRED`           | 리프레시 토큰 만료          |
| `INVALID_REFRESH_TOKEN`           | 유효하지 않은 리프레시 토큰 |
| `INVALID_TOKEN_TYPE`              | 잘못된 토큰 타입            |
| `MISSING_TOKEN`                   | 인증 토큰 누락              |
| `INVALID_TOKEN_FORMAT`            | 잘못된 토큰 형식            |
| `TOKEN_EXPIRED`                   | 토큰 만료                   |
| `INVALID_TOKEN`                   | 유효하지 않은 토큰          |
| `TOKEN_VERIFICATION_ERROR`        | 토큰 검증 오류              |
| `TOKEN_VERIFICATION_SERVER_ERROR` | 토큰 검증 서버 오류         |

## 테스트 계정

- **ID**: test
- **Password**: test

## 사용 예시

### JavaScript (Fetch API)

```javascript
// 로그인
const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "test",
    password: "test",
  }),
});

const loginData = await loginResponse.json();
const { accessToken, refreshToken } = loginData.data;

// 토큰 검증
const verifyResponse = await fetch("http://localhost:3000/api/auth/verify", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// 토큰 갱신
const refreshResponse = await fetch("http://localhost:3000/api/auth/refresh", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    refreshToken: refreshToken,
  }),
});
```
