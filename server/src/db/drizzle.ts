import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const sql = neon(process.env.DB_CONNECTION_URI!);

export const db = drizzle(sql, { schema });