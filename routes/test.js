const express = require("express");

const router = express.Router();

// 테스트용 GET API
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "정상요청입니다.",
    timestamp: new Date().toISOString(),
    data: {
      status: "OK",
      server: "JWT Mock Server",
      version: "1.0.0",
    },
  });
});

module.exports = router;
