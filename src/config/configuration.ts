import { AppConfig } from './configuration-type';

export default (): AppConfig => ({
  port: parseInt(process.env.DATABASE_PORT ?? '3001', 10),
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  redisCache: {
    url: process.env.REDIS_CACHE_URL,
    host: process.env.REDIS_CACHE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    password: process.env.REDIS_CACHE_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiration: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRATION ?? '1',
    ),
  },
});
