import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { EAppConfig, JwtConfig } from 'src/config/configuration-type';

export const jwtAsyncConfig: JwtModuleAsyncOptions = {
  global: true,
  useFactory: (configService: ConfigService) => {
    const jwtConfig = configService.get<JwtConfig>(EAppConfig.JWT_CONFIG);
    return {
      secret: jwtConfig?.secret,
      signOptions: { expiresIn: jwtConfig?.accessTokenExpiration },
    };
  },
  inject: [ConfigService],
};
