import { getRequestListener } from "@hono/node-server"
import app from "../dist/index.js"

export default getRequestListener((request) => app.fetch(request, process.env))
