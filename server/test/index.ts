import sql from "../src/db";
import { log } from "../utils/logger";

export async function testDBConnection() {
  try {
    await sql`SELECT 1`;
    log.info("Database connection successful.");
  } catch (error) {
     log.error("Database connection failed", error);
    throw error;
  }
}