
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ||
    "https://bazar-dor-iota-seven.vercel.app",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "https://bazar-dor-iota-seven.vercel.app",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
});
