import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sqlFile = process.argv[2] ?? "scripts/migrate-chiho-db.sql";
const ddl = readFileSync(sqlFile, "utf-8")
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = ddl
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

(async () => {
  const sql = neon(url);
  let ok = 0;
  let fail = 0;
  for (const stmt of statements) {
    const preview = stmt.slice(0, 70).replace(/\s+/g, " ");
    try {
      await sql.query(stmt);
      console.log(`OK   : ${preview}`);
      ok++;
    } catch (e) {
      console.error(`FAIL : ${preview}`);
      console.error(`       ${(e as Error).message}`);
      fail++;
    }
  }
  console.log(`\nResult: ${ok} ok, ${fail} fail (total ${statements.length})`);
  process.exit(fail > 0 ? 1 : 0);
})();
