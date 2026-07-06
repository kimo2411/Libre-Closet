import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { StorageLocationService } from './storage-location.service';

@Controller('locations')
export class StorageLocationController {
  constructor(private readonly storageService: StorageLocationService) {}

  @Get()
  @Render('locations/index')
  async index() {
    return {
      pageTitle: '衣物位置',
      locations: await this.storageService.list(),
    };
  }

  @Post()
  async create(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    let name = '';
    let notes = '';
    let created = false;

    for await (const part of req.parts({
      limits: { files: 1, fileSize: 100 * 1024 * 1024 },
    })) {
      if (part.type === 'field') {
        const value = typeof part.value === 'string' ? part.value : '';
        if (part.fieldname === 'name') name = value;
        if (part.fieldname === 'notes') notes = value;
        continue;
      }

      if (part.fieldname === 'cover' && part.filename && name.trim()) {
        await this.storageService.create({ name, notes, cover: part });
        created = true;
      } else {
        part.file.resume();
      }
    }

    if (!created && name.trim()) {
      await this.storageService.create({ name, notes });
    }
    return reply.redirect('/locations', 302);
  }

  @Get(':id')
  @Render('locations/show')
  async show(@Param('id', ParseIntPipe) id: number) {
    return {
      pageTitle: '存储位置',
      location: await this.storageService.find(id),
    };
  }

  @Post(':id/items')
  async addItems(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    await this.storageService.addItems(
      id,
      req.files({ limits: { files: 100, fileSize: 100 * 1024 * 1024 } }),
    );
    return reply.redirect(`/locations/${id}`, 302);
  }

  @Post(':id/cover')
  async updateCover(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const cover = await req.file({ limits: { fileSize: 100 * 1024 * 1024 } });
    await this.storageService.updateCover(id, cover);
    return reply.redirect(`/locations/${id}`, 302);
  }

  @Post(':id/delete')
  async deleteLocation(
    @Param('id', ParseIntPipe) id: number,
    @Res() reply: FastifyReply,
  ) {
    await this.storageService.deleteLocation(id);
    return reply.redirect('/locations', 302);
  }

  @Post('items/:id/delete')
  async deleteItem(
    @Param('id', ParseIntPipe) id: number,
    @Res() reply: FastifyReply,
  ) {
    const locationId = await this.storageService.deleteItem(id);
    return reply.redirect(`/locations/${locationId}`, 302);
  }
}
