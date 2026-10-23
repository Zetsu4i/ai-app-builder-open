// agent-service — shared Prisma client (same SQLite as the Next app).
// The generated client resolves the schema datasource url (db/custom.db) on its own.
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
export default db;
