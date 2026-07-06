import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MultipartFile } from '@fastify/multipart';
import { File } from 'src/dal/entity/file.entity';
import { Readable } from 'stream';
import { FileServiceInterface } from './file-service.interface';

@Injectable()
export abstract class FileService implements FileServiceInterface {
  public logger = new Logger(FileService.name);

  constructor(readonly configService: ConfigService) {}

  public nobgFileName(fileName: string): string {
    const extIndex = fileName.lastIndexOf('.');
    return extIndex === -1
      ? `${fileName}-nobg`
      : `${fileName.slice(0, extIndex)}-nobg${fileName.slice(extIndex)}`;
  }

  async getNobgVariant(fileName: string): Promise<Readable | null> {
    const nobgName = this.nobgFileName(fileName);

    const existing = await this.get(nobgName).catch(() => undefined);
    if (existing) {
      return existing;
    }

    return null;
  }

  abstract storeImageFromFileUpload(
    upload: MultipartFile | undefined,
    userId: any,
    fileName?: string,
  ): Promise<File>;
  abstract copyImage(
    sourceFileName: string,
    userId?: number,
  ): Promise<File | undefined>;
  abstract delete(fileName: string): Promise<void>;

  async storeNobgVariantFromStream(
    stream: Readable,
    originalFileName: string,
  ): Promise<void> {
    const nobgName = this.nobgFileName(originalFileName);
    await this.store(nobgName, stream);
  }

  abstract deleteById(fileId: any, userId: any): Promise<any>;
  abstract get(fileName: string): Promise<Readable | undefined>;
  abstract getByShareableId(shareableId: string): Promise<Readable | undefined>;
  protected abstract store(fileName: string, stream: Readable): Promise<void>;

  async watermarkImage(
    fileStream: Readable | undefined,
  ): Promise<Readable | undefined> {
    return fileStream;
  }
}
