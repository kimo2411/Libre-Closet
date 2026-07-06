import { MikroORM } from '@mikro-orm/core';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DalModule } from './dal/dal.module';
import { ErrorViewFilter } from './error-view.filter';
import { FileModule } from './file/file.module';
import { StorageLocationModule } from './storage-location/storage-location.module';
import { ViewContextModule } from './view-context/view-context.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options = {
          singleLine: true,
          colorize: true,
          levelFirst: false,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          destination: 1,
        };
        return {
          pinoHttp: {
            transport: {
              targets: [
                {
                  target: 'pino-pretty',
                  level: 'info',
                  options,
                },
                {
                  target: 'pino-pretty',
                  level: 'info',
                  options: {
                    ...options,
                    destination: path.join(
                      configService.getOrThrow('DATA_PATH'),
                      'app.log',
                    ),
                    mkdir: true,
                  },
                },
              ],
            },
          },
        };
      },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('production'),
        PORT: Joi.number().default(3000),
        APP_NAME: Joi.string().default('家庭衣物相册'),
        AUTH_ENABLED: Joi.boolean().default(false),
        DISABLE_REGISTRATION: Joi.boolean().default(true),
        PWA_ENABLED: Joi.boolean().default(false),
        ACCESS_TOKEN_SECRET: Joi.string().default('ChangeMe!'),
        SITE_URL: Joi.string().default('http://localhost:32180'),
        ICON_NAME: Joi.string().default('lazztech_icon.webp'),
        DATA_PATH: Joi.string().default(path.join(process.cwd(), 'data')),
        DATABASE_TYPE: Joi.string().valid('sqlite').default('sqlite'),
        DATABASE_SCHEMA: Joi.string().default((parent) =>
          path.join(parent.DATA_PATH, 'sqlite3.db'),
        ),
        FILE_STORAGE_TYPE: Joi.string().valid('local').default('local'),
      }),
      validationOptions: {
        abortEarly: true,
      },
      isGlobal: true,
    }),
    ThrottlerModule.forRoot(),
    DalModule,
    FileModule,
    ViewContextModule,
    StorageLocationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorViewFilter,
    },
  ],
})
export class AppModule implements OnModuleInit {
  public logger = new Logger(AppModule.name);

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log(`NODE_ENV: ${this.configService.get('NODE_ENV')}`);
    this.logger.log(`DATA_PATH: ${this.configService.get('DATA_PATH')}`);
    await this.orm.migrator.up();
  }
}
