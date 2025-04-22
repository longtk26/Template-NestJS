const config = () => ({
  port: process.env.PORT || 3000,
  env: process.env.ENV || 'dev',
  secretKey: process.env.SECRET_KEY,
  database: {
    postgresUri: process.env.POSTGRES_URI,
  },
  redis: {
    redisUri: process.env.REDIS_URI,
  },
  broker: {
    host: process.env.BROKER_HOST,
    port: process.env.BROKER_PORT,
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    isSecure: process.env.EMAIL_SECURE,
    service: process.env.EMAIL_SERVICE,
  },
  timeNotifyRemider: process.env.TIME_NOTIFY_REMINDER || 1000 * 60 * 5,
  clientUrl: process.env.CLIENT_URL,
  jwt: {
    accessTokenExpires: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    refreshTokenExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES,
  },
  saltRounds: process.env.SALT_ROUNDS,
});

export enum ConfigEnum {
  PORT = 'port',
  DATABASE_CONFIG = 'database',
  REDIS_CONFIG = 'redis',
  ENV = 'env',
  BROKER_CONFIG = 'broker',
  SECRET_KEY = 'secretKey',
  EMAIL_CONFIG = 'email',
  TIME_NOTIFY_REMINDER = 'timeNotifyRemider',
  CLIENT_URL = 'clientUrl',
  JWT_CONFIG = 'jwt',
  SALT_ROUNDS = 'saltRounds',
}

export default config;
