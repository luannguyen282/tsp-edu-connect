import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: "../../.env", override: false });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env and configure PostgreSQL.");
  process.exit(1);
}

const client = new pg.Client({ connectionString, connectionTimeoutMillis: 3000 });
try {
  await client.connect();
  const result = await client.query("select current_database() as database, current_user as user, version() as version");
  const row = result.rows[0];
  console.log(`PostgreSQL OK: database=${row.database}, user=${row.user}`);
  console.log(String(row.version).split(" on ")[0]);
} catch (error) {
  console.error("Cannot connect to PostgreSQL using DATABASE_URL.");
  console.error(error instanceof Error ? error.message : String(error));
  console.error("Use an existing PostgreSQL instance first; TSPEC does not auto-install PostgreSQL or Docker.");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
