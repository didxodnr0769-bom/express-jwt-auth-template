require("dotenv").config();
const express = require("express");
const cors = require("cors");
const config = require("./config");
const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "JWT Mock Server",
    version: "1.0.0",
    endpoints: {
      login: "POST /api/auth/login",
      refresh: "POST /api/auth/refresh",
      verify: "GET /api/auth/verify",
      test: "GET /api/test",
      testAuth: "GET /api/test/auth (토큰 필요)",
    },
  });
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "서버 내부 오류가 발생했습니다.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 처리
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "요청한 엔드포인트를 찾을 수 없습니다.",
    path: req.originalUrl,
  });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 JWT Mock Server가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📝 사용 가능한 엔드포인트:`);
  console.log(`   - POST /api/auth/login (로그인)`);
  console.log(`   - POST /api/auth/refresh (토큰 갱신)`);
  console.log(`   - GET /api/auth/verify (토큰 검증)`);
  console.log(`   - GET /api/test (테스트)`);
  console.log(`   - GET /api/test/auth (토큰 필요)`);
});
