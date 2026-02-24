import { config } from "dotenv"
import { serve } from "@hono/node-server"
import { createApp } from "./app"

config({ path: ".dev.vars" })

const app = createApp()

serve(
  { fetch: (req) => app.fetch(req, process.env), port: 8787 },
  (info) => {
    console.log(`Kebo API running at http://localhost:${info.port}`)
  },
)
