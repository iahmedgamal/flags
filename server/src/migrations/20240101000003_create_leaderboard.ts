import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("leaderboard", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("player_id").references("id").inTable("players").onDelete("CASCADE");
    table.string("player_name").notNullable();
    table.string("avatar").notNullable();
    table.string("game_mode").notNullable();
    table.integer("score").notNullable();
    table.integer("streak").notNullable();
    table.integer("total_questions").notNullable();
    table.integer("correct_answers").notNullable();
    table.float("time_seconds").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("leaderboard");
}
