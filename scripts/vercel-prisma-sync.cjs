const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
const hasMigrationFolders =
  fs.existsSync(migrationsDir) &&
  fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .some((entry) => entry.isDirectory() && !entry.name.startsWith("."));

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

if (hasMigrationFolders) {
  console.log("Detected Prisma migrations. Running migrate deploy...");
  run(npxCommand, ["prisma", "migrate", "deploy"]);
} else {
  console.log("No Prisma migrations found. Running db push to sync schema...");
  run(npxCommand, ["prisma", "db", "push"]);
}
