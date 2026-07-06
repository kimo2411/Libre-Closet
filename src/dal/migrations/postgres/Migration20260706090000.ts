import { Migration } from '@mikro-orm/migrations';

export class Migration20260706090000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "storage_location" ("id" serial primary key, "shareable_id" varchar(255) not null, "flagged" boolean null, "banned" boolean null, "name" varchar(255) not null, "notes" text null, "created_on" timestamptz not null, "cover_id" int null);`,
    );
    this.addSql(
      `alter table "storage_location" add constraint "storage_location_cover_id_foreign" foreign key ("cover_id") references "file" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `create index "storage_location_cover_id_index" on "storage_location" ("cover_id");`,
    );

    this.addSql(
      `create table "clothing_item" ("id" serial primary key, "shareable_id" varchar(255) not null, "flagged" boolean null, "banned" boolean null, "created_on" timestamptz not null, "location_id" int not null, "photo_id" int not null);`,
    );
    this.addSql(
      `alter table "clothing_item" add constraint "clothing_item_location_id_foreign" foreign key ("location_id") references "storage_location" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "clothing_item" add constraint "clothing_item_photo_id_foreign" foreign key ("photo_id") references "file" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create index "clothing_item_location_id_index" on "clothing_item" ("location_id");`,
    );
    this.addSql(
      `create index "clothing_item_photo_id_index" on "clothing_item" ("photo_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "clothing_item" cascade;`);
    this.addSql(`drop table if exists "storage_location" cascade;`);
  }
}
