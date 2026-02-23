import { handle } from "hono/vercel"
import app from "../dist/index.js"

export default handle(app)
