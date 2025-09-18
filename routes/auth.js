const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// 임시 사용자 데이터
const MOCK_USER = {
  email: "test@example.com",
  password: "test",
  name: "Test User",
};

// 로그인 엔드포인트
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);
    // 입력값 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "이메일과 비밀번호를 입력해주세요.",
        code: "MISSING_CREDENTIALS",
      });
    }

    // 사용자 인증
    if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        code: "INVALID_CREDENTIALS",
      });
    }

    // JWT 토큰 생성
    const accessToken = jwt.sign(
      {
        email: MOCK_USER.email,
        name: MOCK_USER.name,
        type: "access",
      },
      config.JWT_SECRET,
      { expiresIn: config.ACCESS_TOKEN_EXPIRE }
    );

    const refreshToken = jwt.sign(
      {
        email: MOCK_USER.email,
        type: "refresh",
      },
      config.JWT_SECRET,
      { expiresIn: config.REFRESH_TOKEN_EXPIRE }
    );

    res.json({
      success: true,
      message: "로그인 성공",
      data: {
        accessToken,
        refreshToken,
        user: {
          email: MOCK_USER.email,
          name: MOCK_USER.name,
        },
        expiresIn: config.ACCESS_TOKEN_EXPIRE,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "로그인 처리 중 오류가 발생했습니다.",
      code: "LOGIN_ERROR",
    });
  }
});

// 토큰 갱신 엔드포인트
router.post("/refresh", (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "리프레시 토큰이 필요합니다.",
        code: "MISSING_REFRESH_TOKEN",
      });
    }

    // 리프레시 토큰 검증
    jwt.verify(refreshToken, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.",
            code: "REFRESH_TOKEN_EXPIRED",
          });
        }

        return res.status(401).json({
          success: false,
          message: "유효하지 않은 리프레시 토큰입니다.",
          code: "INVALID_REFRESH_TOKEN",
        });
      }

      if (decoded.type !== "refresh") {
        return res.status(401).json({
          success: false,
          message: "잘못된 토큰 타입입니다.",
          code: "INVALID_TOKEN_TYPE",
        });
      }

      // 새로운 액세스 토큰 생성
      const newAccessToken = jwt.sign(
        {
          email: decoded.email,
          name: MOCK_USER.name,
          type: "access",
        },
        config.JWT_SECRET,
        { expiresIn: config.ACCESS_TOKEN_EXPIRE }
      );

      res.json({
        success: true,
        message: "토큰이 성공적으로 갱신되었습니다.",
        data: {
          accessToken: newAccessToken,
          expiresIn: config.ACCESS_TOKEN_EXPIRE,
        },
      });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "토큰 갱신 중 오류가 발생했습니다.",
      code: "REFRESH_ERROR",
    });
  }
});

// 토큰 검증 엔드포인트
router.get("/verify", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "토큰이 유효합니다.",
    data: {
      user: req.user,
      tokenInfo: {
        type: req.user.type,
        expiresIn: config.ACCESS_TOKEN_EXPIRE,
      },
    },
  });
});

module.exports = router;
