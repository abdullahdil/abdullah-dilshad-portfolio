/**
 * Full Supabase bootstrap for this portfolio:
 * 1) Apply init migration (requires DB password)
 * 2) Ensure storage buckets
 * 3) Seed verified content
 * 4) Create admin Auth user + authorized_admins row
 *
 * Usage:
 *   SUPABASE_DB_PASSWORD='your-db-password' npm run db:setup
 *
 * Or set SUPABASE_DB_PASSWORD / DATABASE_URL in .env.local
 */

import { config } from "dotenv";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { randomBytes } from "crypto";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

function deriveProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const match = url.match(/^https?:\/\/([a-z0-9]+)\.supabase\.(?:co|in)/i);
  if (!match) {
    throw new Error(
      `Cannot derive the project ref from NEXT_PUBLIC_SUPABASE_URL ("${url}"). ` +
        "Expected https://<project-ref>.supabase.co",
    );
  }
  return match[1];
}

const PROJECT_REF = deriveProjectRef();
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL?.trim() || "abdullahdilshad111@gmail.com";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.includes("your-")) {
    throw new Error(`Missing ${name} in .env.local`);
  }
  return value;
}

function getDatabaseUrlCandidates(): string[] {
  if (process.env.DATABASE_URL?.trim()) {
    return [process.env.DATABASE_URL.trim()];
  }
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      [
        "Missing database password.",
        "Add one of these to .env.local:",
        "  SUPABASE_DB_PASSWORD=your-postgres-password",
        "  DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres",
        "Find it in Supabase → Project Settings → Database → Database password",
        "(or the password you set when creating the project).",
      ].join("\n"),
    );
  }
  const encoded = encodeURIComponent(password);
  const poolerRegions = [
    "ap-northeast-1",
    "ap-northeast-2",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-south-1",
    "eu-central-1",
    "eu-west-1",
    "eu-west-2",
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "sa-east-1",
    "ca-central-1",
  ];
  return [
    // Direct connection is most reliable for DDL.
    `postgresql://postgres:${encoded}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    ...poolerRegions.map(
      (region) =>
        `postgresql://postgres.${PROJECT_REF}:${encoded}@aws-0-${region}.pooler.supabase.com:5432/postgres`,
    ),,
    ...poolerRegions.map(
      (region) =>
        `postgresql://postgres.${PROJECT_REF}:${encoded}@aws-0-${region}.pooler.supabase.com:6543/postgres`,
    ),
  ];
}

async function applyMigration(databaseUrl: string) {
  const sqlPath = resolve("supabase/migrations/20260803000000_init.sql");
  const sql = readFileSync(sqlPath, "utf8");
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Connecting to database…");
  await client.connect();
  try {
    console.log("Applying init migration…");
    await client.query(sql);
    console.log("Migration applied.");
  } finally {
    await client.end();
  }
}

/**
 * Applies the migration through the Supabase Management API.
 * Needs only SUPABASE_ACCESS_TOKEN (a personal access token), so it works
 * when the Postgres password is unknown or the pooler host is unreachable.
 */
async function applyMigrationViaApi(accessToken: string) {
  const sqlPath = resolve("supabase/migrations/20260803000000_init.sql");
  const query = readFileSync(sqlPath, "utf8");

  console.log("Applying init migration via Management API…");
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Management API returned ${response.status}: ${body.slice(0, 500)}`,
    );
  }
  console.log("Migration applied.");
}

// Script client is untyped against generated DB schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetupClient = any;

async function ensureBuckets(supabase: SetupClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  const names = new Set(
    (buckets ?? []).map((b: { name: string }) => b.name),
  );

  if (!names.has("media")) {
    const { error: mediaError } = await supabase.storage.createBucket("media", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (mediaError && !mediaError.message.toLowerCase().includes("already")) {
      throw mediaError;
    }
    console.log("Created bucket: media");
  } else {
    console.log("Bucket exists: media");
  }

  if (!names.has("cv")) {
    const { error: cvError } = await supabase.storage.createBucket("cv", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["application/pdf"],
    });
    if (cvError && !cvError.message.toLowerCase().includes("already")) {
      throw cvError;
    }
    console.log("Created bucket: cv");
  } else {
    console.log("Bucket exists: cv");
  }
}

async function ensureAdminUser(supabase: SetupClient) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) throw listError;

  const existing = listed.users.find(
    (user) => user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  );

  let userId = existing?.id;
  let generatedPassword: string | null = null;

  if (!userId) {
    generatedPassword = `Adm-${randomBytes(9).toString("base64url")}!9`;
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: generatedPassword,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created Auth user: ${ADMIN_EMAIL}`);
  } else {
    console.log(`Auth user already exists: ${ADMIN_EMAIL}`);
  }

  const { error: adminError } = await supabase.from("authorized_admins").upsert(
    { user_id: userId },
    { onConflict: "user_id" },
  );
  if (adminError) throw adminError;
  console.log("Authorized admin row ensured.");

  if (generatedPassword) {
    const credPath = resolve(".admin-credentials.local");
    writeFileSync(
      credPath,
      [
        `ADMIN_EMAIL=${ADMIN_EMAIL}`,
        `ADMIN_PASSWORD=${generatedPassword}`,
        `ADMIN_LOGIN_URL=${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/login`,
        "",
        "This file is gitignored. Change the password after first login.",
        "",
      ].join("\n"),
      { mode: 0o600 },
    );
    console.log(`Wrote login credentials to ${credPath}`);
  }
}

async function runSeed() {
  console.log("Seeding verified content…");
  const { spawnSync } = await import("child_process");
  const result = spawnSync("npm", ["run", "db:seed"], {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error("db:seed failed");
  }
}

async function main() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

  let migrated = false;
  let lastError: unknown;

  // Management API first when a personal access token is available:
  // it needs no DB password and no reachable pooler host.
  if (accessToken) {
    try {
      await applyMigrationViaApi(accessToken);
      migrated = true;
    } catch (error) {
      lastError = error;
      console.warn(
        `Management API migration failed, falling back to direct Postgres: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  if (!migrated) {
    for (const candidate of getDatabaseUrlCandidates()) {
      try {
        await applyMigration(candidate);
        migrated = true;
        break;
      } catch (error) {
        lastError = error;
        console.warn(
          `Migration attempt failed for one connection string: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  if (!migrated) {
    throw lastError instanceof Error
      ? lastError
      : new Error(
          "Unable to apply migration. Set SUPABASE_ACCESS_TOKEN or SUPABASE_DB_PASSWORD.",
        );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await ensureBuckets(supabase);
  await runSeed();
  await ensureAdminUser(supabase);

  console.log("\nSupabase setup complete.");
  console.log("Next: npm run dev → open /admin/login");
  if (existsSync(resolve(".admin-credentials.local"))) {
    console.log("Admin credentials: .admin-credentials.local");
  }
}

main().catch((error: unknown) => {
  console.error("\nSetup failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
