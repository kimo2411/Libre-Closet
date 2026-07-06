import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FileModule } from '../file/file.module';
import { File } from '../dal/entity/file.entity';
import { StorageLocation } from '../dal/entity/storage-location.entity';
import { ClothingItem } from '../dal/entity/clothing-item.entity';
import { StorageLocationController } from './storage-location.controller';
import { StorageLocationService } from './storage-location.service';

@Module({
  imports: [
    FileModule,
    MikroOrmModule.forFeature([StorageLocation, ClothingItem, File]),
  ],
  controllers: [StorageLocationController],
  providers: [StorageLocationService],
})
export class StorageLocationModule {}
