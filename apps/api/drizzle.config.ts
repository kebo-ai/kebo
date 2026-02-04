import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".dev.vars" })

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
