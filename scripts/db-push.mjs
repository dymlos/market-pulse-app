import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(rootDir, "prisma", "schema.prisma");
const prismaCliPath = resolve(rootDir, "node_modules", "prisma", "build", "index.js");

const databaseUrl = process.env.DATABASE_URL ?? "file:../data/market-pulse.db";

if (!databaseUrl.startsWith("file:")) {
  throw new Error("Solo se soportan URLs SQLite con prefijo file: para este bootstrap local.");
}

const relativeDatabasePath = databaseUrl.slice("file:".length);
const absoluteDatabasePath = resolve(rootDir, "prisma", relativeDatabasePath);

mkdirSync(dirname(absoluteDatabasePath), { recursive: true });

const diffSql = execFileSync(
  process.execPath,
  [
    prismaCliPath,
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    schemaPath,
    "--script",
  ],
  {
    cwd: rootDir,
    encoding: "utf8",
    env: process.env,
  },
);

const normalizedSql = diffSql
  .replaceAll("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
  .replaceAll("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ")
  .replaceAll("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ");

const database = new DatabaseSync(absoluteDatabasePath);

database.exec("PRAGMA foreign_keys = ON;");
database.exec(normalizedSql);
database.close();

console.log(`SQLite local inicializada en ${absoluteDatabasePath}`);
