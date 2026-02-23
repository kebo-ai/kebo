import { handle } from "hono/vercel"
import { createApp } from "../src/app"

const app = createApp()

export default handle(app)
