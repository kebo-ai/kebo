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
    if (typeof req.body === "string") {
      // Body is already a string
      init.body = req.body
    } else if (req.body instanceof Buffer) {
      // Body is a raw Buffer
      init.body = req.body
    } else if (req.body && typeof req.body === "object") {
      // Vercel NODEJS_HELPERS parses JSON bodies into objects - re-serialize
      init.body = JSON.stringify(req.body)
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

  // Write response headers
  const responseHeaders = {}
  response.headers.forEach((value, key) => {
    const existing = responseHeaders[key]
    if (existing) {
      responseHeaders[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value]
    } else {
      responseHeaders[key] = value
    }
  })
  res.writeHead(response.status, responseHeaders)

  // Write response body
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
