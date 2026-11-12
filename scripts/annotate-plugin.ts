// Dev-only visual annotation channel between the browser and the coding agent (OMP, Claude Code, Codex).
//
// In `vite dev` the plugin:
//   - injects scripts/annotate-client.js into index.html (never into production builds)
//   - exposes GET/POST/DELETE /__annotate, backed by .omp/annotations.json at the repo root
//
// The user clicks elements on the page and types what to change; the agent reads
// .omp/annotations.json, finds each element via its selector, applies the change, then removes the entry.
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

const MAX_BODY = 64 * 1024
const FILE = path.resolve(__dirname, '..', '.omp', 'annotations.json')
const CLIENT = path.resolve(__dirname, 'annotate-client.js')

type Annotation = { id: string; createdAt: string; status: 'open'; [key: string]: unknown }

function load(): Annotation[] {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function save(items: Annotation[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2) + '\n')
}

// The dev server listens on 0.0.0.0, so only accept same-machine requests with a localhost Host header
// and a JSON content type (cross-origin pages cannot send that without a preflight we never answer).
function isLocal(req: IncomingMessage) {
  const addr = req.socket.remoteAddress || ''
  const host = (req.headers.host || '').replace(/:\d+$/, '')
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(addr) && ['localhost', '127.0.0.1', '[::1]'].includes(host)
}

async function readBody(req: IncomingMessage): Promise<string> {
  let size = 0
  const chunks: Buffer[] = []
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length
    if (size > MAX_BODY) throw new Error('payload too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function annotatePlugin(): Plugin {
  return {
    name: 'velo-annotate',
    apply: 'serve',
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { src: '/__annotate/client.js', defer: true }, injectTo: 'body' }]
    },
    configureServer(server) {
      server.middlewares.use('/__annotate', async (req, res) => {
        const send = (status: number, body: unknown, type = 'application/json') => {
          res.statusCode = status
          res.setHeader('Content-Type', type)
          res.setHeader('Cache-Control', 'no-store')
          res.end(typeof body === 'string' ? body : JSON.stringify(body))
        }
        if (!isLocal(req)) return send(403, { error: 'local requests only' })
        const url = new URL(req.url || '/', 'http://localhost')

        if (req.method === 'GET' && url.pathname === '/client.js') {
          return send(200, fs.readFileSync(CLIENT, 'utf8'), 'text/javascript')
        }
        if (url.pathname !== '/') return send(404, { error: 'not found' })

        if (req.method === 'GET') return send(200, load())
        if (req.method === 'POST') {
          if (!String(req.headers['content-type']).startsWith('application/json')) {
            return send(415, { error: 'application/json required' })
          }
          try {
            const input = JSON.parse(await readBody(req))
            if (typeof input !== 'object' || input === null || typeof input.comment !== 'string' || !input.comment.trim()) {
              return send(400, { error: 'comment required' })
            }
            const item: Annotation = {
              ...input,
              id: Math.random().toString(36).slice(2, 8),
              createdAt: new Date().toISOString(),
              status: 'open',
            }
            save([...load(), item])
            return send(201, item)
          } catch (error) {
            return send(400, { error: error instanceof Error ? error.message : 'bad request' })
          }
        }
        if (req.method === 'DELETE') {
          const id = url.searchParams.get('id')
          save(id ? load().filter((item) => item.id !== id) : [])
          return send(200, load())
        }
        return send(405, { error: 'method not allowed' })
      })
    },
  }
}
