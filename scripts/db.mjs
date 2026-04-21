import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = resolve(rootDir, "prisma", "migrations");
const mode = process.argv[2] ?? "apply";
const databaseUrl = process.env.DATABASE_URL ?? "file:../data/market-pulse.local.db";

if (!databaseUrl.startsWith("file:")) {
  throw new Error("Solo se soportan URLs SQLite con prefijo file: para este flujo local.");
}

const relativeDatabasePath = databaseUrl.slice("file:".length);
const absoluteDatabasePath = resolve(rootDir, "prisma", relativeDatabasePath);

function ensureDatabaseDirectory() {
  mkdirSync(dirname(absoluteDatabasePath), { recursive: true });
}

function openDatabase() {
  const database = new DatabaseSync(absoluteDatabasePath);
  database.exec("PRAGMA foreign_keys = ON;");
  return database;
}

function ensureMigrationsTable(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "migration_name" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "applied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function getAppliedMigrations(database) {
  const rows = database
    .prepare('SELECT "migration_name", "checksum" FROM "_prisma_migrations" ORDER BY "migration_name" ASC')
    .all();

  return new Map(rows.map((row) => [row.migration_name, row.checksum]));
}

function getExistingUserTables(database) {
  const rows = database
    .prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        AND name != '_prisma_migrations'
      ORDER BY name ASC
    `)
    .all();

  return rows.map((row) => row.name);
}

function getMigrationDirectories() {
  if (!existsSync(migrationsDir)) {
    return [];
  }

  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function applyMigrations(database) {
  const appliedMigrations = getAppliedMigrations(database);
  const existingUserTables = getExistingUserTables(database);

  if (existingUserTables.length > 0 && appliedMigrations.size === 0) {
    throw new Error(
      [
        "Se detecto una base existente sin historial de migraciones.",
        "Para alinear el esquema con la migracion versionada, corre `npm run db:reset` y despues `npm run db:seed`.",
      ].join(" "),
    );
  }

  const migrationDirectories = getMigrationDirectories();

  if (migrationDirectories.length === 0) {
    console.log("No se encontraron migraciones en prisma/migrations.");
    return;
  }

  let appliedCount = 0;

  for (const migrationName of migrationDirectories) {
    const migrationPath = resolve(migrationsDir, migrationName, "migration.sql");
    const sql = readFileSync(migrationPath, "utf8").trim();
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existingChecksum = appliedMigrations.get(migrationName);

    if (existingChecksum) {
      if (existingChecksum !== checksum) {
        throw new Error(`La migracion ${migrationName} ya fue aplicada con un checksum distinto.`);
      }

      continue;
    }

    database.exec("BEGIN");

    try {
      database.exec(sql);
      database
        .prepare(
          'INSERT INTO "_prisma_migrations" ("migration_name", "checksum") VALUES (?, ?)',
        )
        .run(migrationName, checksum);
      database.exec("COMMIT");
      appliedCount += 1;
      console.log(`Migracion aplicada: ${migrationName}`);
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  if (appliedCount === 0) {
    console.log("La base ya estaba alineada con las migraciones versionadas.");
    return;
  }

  console.log(`Se aplicaron ${appliedCount} migracion(es) en ${absoluteDatabasePath}`);
}

function main() {
  if (!["apply", "reset"].includes(mode)) {
    throw new Error(`Modo no soportado: ${mode}. Usa "apply" o "reset".`);
  }

  ensureDatabaseDirectory();

  if (mode === "reset" && existsSync(absoluteDatabasePath)) {
    rmSync(absoluteDatabasePath, { force: true });
    console.log(`Base eliminada para recreacion: ${absoluteDatabasePath}`);
  }

  const database = openDatabase();

  try {
    ensureMigrationsTable(database);
    applyMigrations(database);
  } finally {
    database.close();
  }
}

main();
