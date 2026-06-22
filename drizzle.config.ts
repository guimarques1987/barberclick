import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://user_MBGpxe:password_pGBMYK@209.50.229.30:5437/postgres",
  },
  verbose: true,
  strict: true,
});
