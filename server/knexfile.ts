import type { Knex } from "knex";
import "dotenv/config";

const config: Knex.Config = {
  client: "pg",
  connection: process.env.DATABASE_URL || "postgres://flags:flags@localhost:5432/flags",
  migrations: {
    directory: "./src/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/seeds",
    extension: "ts",
  },
};

export default config;
