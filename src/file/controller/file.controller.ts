import { Controller, Get, Header, Logger, Param, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { FileService } from '../file-service.abstract';

@Controller('file')
export class FileController {
  private logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Get(':fileName')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async getFile(@Param('fileName') fileName: string) {
    return this.fileService.get(fileName);
  }

  @Get('watermark/:shareableId')
  @Header('Cache-Control', 'public, max-age=86400')
  @Header('content-type', 'image/jpeg')
  async watermark(@Param('shareableId') shareableId: string) {
    const fileStream = await this.fileService.getByShareableId(shareableId);
    return this.fileService.watermarkImage(fileStream);
  }

  @Get('nobg/:fileName')
  @Header('content-type', 'image/webp')
  nobg(@Param('fileName') fileName: string, @Res() reply: FastifyReply) {
    this.logger.debug(`Redirecting removed nobg route for ${fileName}`);
    return reply
      .header('Cache-Control', 'no-store')
      .redirect(`/file/${fileName}`, 302);
  }
}
