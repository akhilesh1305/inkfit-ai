import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

run("npx prisma generate");

if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL found — syncing schema...");
  run("npx prisma db push --skip-generate --accept-data-loss");
} else {
  console.warn("DATABASE_URL not set — skipping prisma db push (add Postgres before using dashboard APIs).");
}

run("npx next build");
