export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: 'api',
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'super-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
