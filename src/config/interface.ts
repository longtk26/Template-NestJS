import config from './config';

export interface DatabaseConfig {
  postgresUri: string;
}

export interface RedisConfig {
  redisUri: string;
}

export interface BrokerConfig {
  host: string;
  port: string;
}

export interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: string;
  isSecure: boolean;
  service: string;
}

export interface JwtConfig {
  accessTokenExpires: string;
  refreshTokenExpires: string;
}

export type ConfigType = ReturnType<typeof config>;
export type ConfigObjKey = keyof ConfigType;
