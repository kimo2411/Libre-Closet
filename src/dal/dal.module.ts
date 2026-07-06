import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { MikroOrmModule, MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import path from 'path';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          name: 'sqlite',
          driver: BetterSqliteDriver,
          baseDir: process.cwd(),
          dbName: configService.getOrThrow('DATABASE_SCHEMA'),
          autoLoadEntities: true,
          extensions: [Migrator],
          migrations: {
            pattern: /^.*\.(js|ts)$/,
            path: path.join(__dirname, 'migrations/sqlite'),
            pathTs: path.join(__dirname, 'migrations/sqlite'),
            transactional: true,
          },
          logger: (message) => console.log(message),
          allowGlobalContext: true,
          debug: configService.get('NODE_ENV') !== 'production',
        }) as MikroOrmModuleOptions<IDatabaseDriver<Connection>>,
      driver: BetterSqliteDriver,
    }),
  ],
})
export class DalModule implements OnModuleInit {
  private logger = new Logger(DalModule.name);

  constructor(
    private configService: ConfigService,
    private readonly orm: MikroORM,
  ) {}

  async onModuleInit() {
    this.logger.log(
      `Using sqlite db: ${this.configService.getOrThrow('DATABASE_SCHEMA')}`,
    );
    await this.orm.em.getConnection().execute('PRAGMA journal_mode = WAL;');
    this.logger.log('SQLite WAL mode enabled');
  }
}
