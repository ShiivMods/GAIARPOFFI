import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

if (process.env.NODE_ENV === "production" || process.env.GAIA_LOCAL_AUTH !== "1") {
  throw new Error("Configuration locale obligatoire.");
}
const url = new URL(process.env.DATABASE_URL ?? "");
if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.port !== "54329" || url.pathname !== "/gaiarp_dev" || url.protocol !== "postgresql:") {
  throw new Error("La base doit être la base PostgreSQL locale dédiée gaiarp_dev.");
}
const sql = postgres(url.toString(), { max: 1, connect_timeout: 5 });
try {
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(8032174)`;
    await tx`create table if not exists gaia_schema_migrations (name text primary key, checksum text not null)`;
    const folder = new URL("../db/migrations/", import.meta.url);
    for (const name of (await readdir(folder)).filter(n => n.endsWith(".sql")).sort()) {
      const source = await readFile(new URL(name, folder), "utf8");
      const checksum = createHash("sha256").update(source).digest("hex");
      const [existing] = await tx`select checksum from gaia_schema_migrations where name = ${name}`;
      if (existing) {
        if (existing.checksum !== checksum) throw new Error("Migration déjà appliquée modifiée : " + name);
        continue;
      }
      await tx.unsafe(source);
      await tx`insert into gaia_schema_migrations (name, checksum) values (${name}, ${checksum})`;
    }
    await tx.unsafe(await readFile(new URL("../db/seed.sql", import.meta.url), "utf8"));
  });
  console.log("Base locale initialisée et comptes de test disponibles.");
} finally {
  await sql.end();
}
