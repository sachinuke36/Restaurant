import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./drizzle";
import { log } from "../../utils/logger";

async function runMigration() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  log.info("Migration completed");
}

runMigration();