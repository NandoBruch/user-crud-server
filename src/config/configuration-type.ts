export interface DatabaseConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface RedisCacheConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
}

export interface JwtConfig {
  secret?: string;
  accessTokenExpiration?: number;
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  redisCache: RedisCacheConfig;
  jwt: JwtConfig;
}

export enum EAppConfig {
  DATABASE_CONFIG = 'database',
  REDIS_CACHE_COFNIG = 'redisCache',
  JWT_CONFIG = 'jwt',
}
