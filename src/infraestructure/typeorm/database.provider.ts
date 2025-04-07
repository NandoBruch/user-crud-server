import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DatabaseConfig, EAppConfig } from 'src/config/configuration-type';
import { User } from 'src/modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseConfig = configService.get<DatabaseConfig>(
      EAppConfig.DATABASE_CONFIG,
    );

    return {
      ...databaseConfig,
      type: 'mysql',
      entities: [__dirname + '../../../**/*.entity.{ts,js}'],
      migrations: [__dirname + '/migrations/*.{ts,js}'],
      migrationsRun: true,
    };
  },
  dataSourceFactory: async (options) => {
    const dataSource = new DataSource(options as DataSourceOptions);
    await dataSource.initialize();

    // Para facilitar o uso da aplicação será criado um usuário administrador
    const adminEmail = 'admin@email.com';

    const userRepo = dataSource.getRepository(User);
    const admin = await userRepo.findOneBy({ email: adminEmail });

    if (!admin) {
      const password = await bcrypt.hash('admin', 10);
      const newAdmin = userRepo.create({
        email: adminEmail,
        password,
        firstName: 'admin',
        lastName: 'user',
        phone: '(99) 99999-9999',
      });
      await userRepo.save(newAdmin);
    }

    return dataSource;
  },
};
