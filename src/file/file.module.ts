import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { File } from '../dal/entity/file.entity';
import { FileController } from './controller/file.controller';
import { FileService } from './file-service.abstract';
import { FileUrlService } from './file-url/file-url.service';
import { LocalFileService } from './local-file/local-file.service';

@Module({
  imports: [MikroOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [
    {
      provide: FileService,
      useFactory: (
        configService: ConfigService,
        localFileService: LocalFileService,
      ) => {
        FileModule.logger.log(
          `Using local file storage: ${process.cwd()}/${configService.get(
            'DATA_PATH',
          )}`,
        );
        return localFileService;
      },
      inject: [ConfigService, LocalFileService],
    },
    LocalFileService,
    FileUrlService,
  ],
  exports: [FileService, FileUrlService],
})
export class FileModule {
  public static logger = new Logger(FileModule.name);
}
