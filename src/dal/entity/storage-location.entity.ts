import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import { File } from './file.entity';
import { ShareableId } from './shareableId.entity';
import { ClothingItem } from './clothing-item.entity';

@Entity()
export class StorageLocation extends ShareableId {
  @PrimaryKey()
  public id!: number;

  @Property()
  public name!: string;

  @Property({ nullable: true, columnType: 'text' })
  public notes?: string;

  @Property({ type: Date })
  public createdOn = new Date();

  @ManyToOne({
    entity: () => File,
    deleteRule: 'set null',
    nullable: true,
    ref: true,
  })
  public cover?: Ref<File>;

  @OneToMany(() => ClothingItem, (item) => item.location)
  public items = new Collection<ClothingItem>(this);
}
