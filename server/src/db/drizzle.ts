import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config({ path: ".env" });

// Enable WebSocket for transactions support
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DB_CONNECTION_URI! });

export const db = drizzle(pool, { schema });