import { Migration } from '@mikro-orm/migrations';

export class Migration20260706090000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`storage_location\` (\`id\` integer not null primary key autoincrement, \`shareable_id\` text not null, \`flagged\` integer null, \`banned\` integer null, \`name\` text not null, \`notes\` text null, \`created_on\` datetime not null, \`cover_id\` integer null, constraint \`storage_location_cover_id_foreign\` foreign key(\`cover_id\`) references \`file\`(\`id\`) on delete set null on update cascade);`,
    );
    this.addSql(
      `create index \`storage_location_cover_id_index\` on \`storage_location\` (\`cover_id\`);`,
    );

    this.addSql(
      `create table \`clothing_item\` (\`id\` integer not null primary key autoincrement, \`shareable_id\` text not null, \`flagged\` integer null, \`banned\` integer null, \`created_on\` datetime not null, \`location_id\` integer not null, \`photo_id\` integer not null, constraint \`clothing_item_location_id_foreign\` foreign key(\`location_id\`) references \`storage_location\`(\`id\`) on delete cascade on update cascade, constraint \`clothing_item_photo_id_foreign\` foreign key(\`photo_id\`) references \`file\`(\`id\`) on delete cascade on update cascade);`,
    );
    this.addSql(
      `create index \`clothing_item_location_id_index\` on \`clothing_item\` (\`location_id\`);`,
    );
    this.addSql(
      `create index \`clothing_item_photo_id_index\` on \`clothing_item\` (\`photo_id\`);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`clothing_item\`;`);
    this.addSql(`drop table if exists \`storage_location\`;`);
  }
}
