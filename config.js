module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
  PORT: process.env.PORT || 3000,
  ACCESS_TOKEN_EXPIRE: "5m",
  REFRESH_TOKEN_EXPIRE: "1d",
};
