import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import { File } from './file.entity';
import { ShareableId } from './shareableId.entity';
import { StorageLocation } from './storage-location.entity';

@Entity()
export class ClothingItem extends ShareableId {
  @PrimaryKey()
  public id!: number;

  @Property({ type: Date })
  public createdOn = new Date();

  @ManyToOne({
    entity: () => StorageLocation,
    deleteRule: 'cascade',
    ref: true,
  })
  public location!: Ref<StorageLocation>;

  @ManyToOne({
    entity: () => File,
    deleteRule: 'cascade',
    ref: true,
  })
  public photo!: Ref<File>;
}
