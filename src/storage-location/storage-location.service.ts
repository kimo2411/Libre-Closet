import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { ClothingItem } from '../dal/entity/clothing-item.entity';
import { File } from '../dal/entity/file.entity';
import { StorageLocation } from '../dal/entity/storage-location.entity';
import { FileService } from '../file/file-service.abstract';

@Injectable()
export class StorageLocationService {
  constructor(
    @InjectRepository(StorageLocation)
    private readonly locationRepository: EntityRepository<StorageLocation>,
    @InjectRepository(ClothingItem)
    private readonly itemRepository: EntityRepository<ClothingItem>,
    private readonly fileService: FileService,
    private readonly em: EntityManager,
  ) {}

  async list() {
    const locations = await this.locationRepository.findAll({
      populate: ['cover', 'items'],
      orderBy: { id: 'desc' },
    });

    return locations.map((location) => ({
      location,
      itemCount: location.items.length,
    }));
  }

  async find(id: number): Promise<StorageLocation> {
    const location = await this.locationRepository.findOne(id, {
      populate: ['cover', 'items.photo'],
    });
    if (!location) throw new NotFoundException('Storage location not found');
    return location;
  }

  async create(input: {
    name: string;
    notes?: string;
    cover?: MultipartFile;
  }): Promise<StorageLocation> {
    const cover = input.cover
      ? await this.fileService.storeImageFromFileUpload(input.cover, undefined)
      : undefined;
    const location = this.locationRepository.create({
      name: input.name.trim(),
      notes: input.notes?.trim() || undefined,
      cover,
    });
    await this.em.persistAndFlush(location);
    return location;
  }

  async updateCover(id: number, coverUpload?: MultipartFile): Promise<void> {
    if (!coverUpload) return;
    const location = await this.find(id);
    await this.deleteFileEntity(location.cover);
    location.cover = await this.fileService.storeImageFromFileUpload(
      coverUpload,
      undefined,
    );
    await this.em.flush();
  }

  async addItems(id: number, uploads: AsyncIterable<MultipartFile>) {
    const location = await this.find(id);
    let uploaded = 0;

    for await (const upload of uploads) {
      if (upload.fieldname !== 'photos' || !upload.filename) {
        upload.file.resume();
        continue;
      }
      const photo = await this.fileService.storeImageFromFileUpload(
        upload,
        undefined,
      );
      const item = this.itemRepository.create({ location, photo });
      this.em.persist(item);
      uploaded += 1;
    }

    if (uploaded > 0) {
      await this.em.flush();
    }
    return uploaded;
  }

  async deleteItem(id: number): Promise<number> {
    const item = await this.itemRepository.findOne(id, {
      populate: ['location', 'photo'],
    });
    if (!item) throw new NotFoundException('Item not found');
    const locationId = item.location.id;
    await this.deleteFileEntity(item.photo);
    await this.em.removeAndFlush(item);
    return locationId;
  }

  async deleteLocation(id: number): Promise<void> {
    const location = await this.find(id);
    for (const item of location.items) {
      await this.deleteFileEntity(item.photo);
    }
    await this.deleteFileEntity(location.cover);
    await this.em.removeAndFlush(location);
  }

  private async deleteFileEntity(file?: File | { unwrap?: () => File }) {
    if (!file) return;
    const entity = 'unwrap' in file ? file.unwrap() : file;
    if (entity?.fileName) {
      await this.fileService.delete(entity.fileName);
    }
    if (entity) {
      this.em.remove(entity);
    }
  }
}
