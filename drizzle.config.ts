import { defineConfig } from "drizzle-kit";

// Only configure drizzle if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL found - skipping database configuration");
  // Export a minimal config to prevent errors
  export default defineConfig({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
  });
} else {
  export default defineConfig({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
      url: process.env.DATABASE_URL,
    },
  });
}
