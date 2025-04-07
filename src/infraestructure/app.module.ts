import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Modules } from '../modules';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from 'src/request/http/guard/auth-guard';
import { redisCacheAsyncConfig } from './redis/redis-cache.provider';
import { typeOrmAsyncConfig } from './typeorm/database.provider';
import { jwtAsyncConfig } from './jwt/jtw.provider';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { RequestLoggerMiddleware } from '@src/request/http/middleware/request-logger-middleware';
import { TypeOrmExceptionMappinInterceptor } from '@src/request/http/interceptor/typeorm-exception-mapping.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    JwtModule.registerAsync(jwtAsyncConfig),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('UserCrudServer', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
    CacheModule.registerAsync(redisCacheAsyncConfig),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ...Modules,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TypeOrmExceptionMappinInterceptor,
    },
    Logger,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
