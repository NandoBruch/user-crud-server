import KeyvRedis, { Keyv, RedisClientOptions } from '@keyv/redis';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { EAppConfig, RedisCacheConfig } from 'src/config/configuration-type';

export const redisCacheAsyncConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: (configService: ConfigService) => {
    const redisCacheConfig = configService.get<RedisCacheConfig>(
      EAppConfig.REDIS_CACHE_COFNIG,
    );

    const { url, password, ...socketConfig } = redisCacheConfig ?? {};
    const options: RedisClientOptions = {
      url,
      password,
      socket: socketConfig,
    };

    return {
      stores: [new Keyv({ store: new KeyvRedis(options) })],
    };
  },
  inject: [ConfigService],
};
