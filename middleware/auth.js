const jwt = require("jsonwebtoken");
const config = require("../config");

// JWT 토큰 검증 미들웨어
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "인증 토큰이 필요합니다.",
        code: "MISSING_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer 토큰에서 실제 토큰 추출

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "올바른 인증 토큰 형식이 아닙니다.",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // 토큰 검증
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "토큰이 만료되었습니다.",
            code: "TOKEN_EXPIRED",
          });
        }

        if (err.name === "JsonWebTokenError") {
          return res.status(401).json({
            success: false,
            message: "유효하지 않은 토큰입니다.",
            code: "INVALID_TOKEN",
          });
        }

        return res.status(401).json({
          success: false,
          message: "토큰 검증 중 오류가 발생했습니다.",
          code: "TOKEN_VERIFICATION_ERROR",
        });
      }

      if (decoded.type !== "access") {
        return res.status(401).json({
          success: false,
          message: "잘못된 토큰 타입입니다.",
          code: "INVALID_TOKEN_TYPE",
        });
      }

      // 검증된 사용자 정보를 req.user에 저장
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "토큰 검증 중 서버 오류가 발생했습니다.",
      code: "TOKEN_VERIFICATION_SERVER_ERROR",
    });
  }
};

module.exports = {
  verifyToken,
};
