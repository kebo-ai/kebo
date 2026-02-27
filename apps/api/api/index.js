import app from "../dist/index.js"

// Custom Vercel handler that properly buffers the request body
// before passing to Hono. The getRequestListener from @hono/node-server
// has a known issue where the body stream hangs on Vercel's serverless runtime.
export default async function handler(req, res) {
  const url = `https://${req.headers.host}${req.url}`
  const headers = new Headers()
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    headers.append(req.rawHeaders[i], req.rawHeaders[i + 1])
  }

  const init = {
    method: req.method,
    headers,
  }

  // Buffer the body for non-GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (req.body) {
      // Vercel with NODEJS_HELPERS=1 provides req.body as a Buffer
      init.body = req.body
    } else if (req.rawBody) {
      // Some Vercel versions use rawBody
      init.body = req.rawBody
    } else {
      // Fallback: manually buffer the stream
      const chunks = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }
      if (chunks.length > 0) {
        init.body = Buffer.concat(chunks)
      }
    }
  }

  const request = new Request(url, init)
  const response = await app.fetch(request, process.env)

  // Write response back to Vercel's res object
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()))
  if (response.body) {
    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
  }
  res.end()
}
