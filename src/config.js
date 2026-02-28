const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  tokenTtl: process.env.TOKEN_TTL || '12h'
};

module.exports = config;
