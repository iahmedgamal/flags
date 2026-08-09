import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("countries", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name").notNullable().unique();
    table.string("capital").notNullable();
    table.string("flag_url").notNullable();
    table.string("continent").notNullable();
    table.string("region");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("countries");
}
