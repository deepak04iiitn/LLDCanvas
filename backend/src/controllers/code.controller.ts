import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/error'

const COMPILER_API = 'https://api.onlinecompiler.io/api/run-code-sync/'

export const SUPPORTED_COMPILERS = [
  { label: 'Python 3.14',      value: 'python-3.14'      },
  { label: 'C (GCC 15)',       value: 'gcc-15'           },
  { label: 'C++ (G++ 15)',     value: 'g++-15'           },
  { label: 'Java 25',          value: 'openjdk-25'       },
  { label: 'C# (.NET 9)',      value: 'dotnet-csharp-9'  },
  { label: 'F# (.NET 9)',      value: 'dotnet-fsharp-9'  },
  { label: 'PHP 8.5',          value: 'php-8.5'          },
  { label: 'Ruby 4.0',         value: 'ruby-4.0'         },
  { label: 'Haskell 9.12',     value: 'haskell-9.12'     },
  { label: 'Go 1.26',          value: 'go-1.26'          },
  { label: 'Rust 1.93',        value: 'rust-1.93'        },
  { label: 'TypeScript (Deno)','value': 'typescript-deno' },
] as const

const VALID_COMPILERS = new Set(SUPPORTED_COMPILERS.map(c => c.value))

export async function runCode(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = process.env.ONLINE_COMPILER_API_KEY
    if (!apiKey) throw createError('Code execution is not configured on this server.', 503)

    const { compiler, code, input = '' } = req.body as {
      compiler: string
      code: string
      input?: string
    }

    if (!compiler || !VALID_COMPILERS.has(compiler)) {
      throw createError('Invalid compiler specified.', 400)
    }
    if (!code || typeof code !== 'string') {
      throw createError('Code is required.', 400)
    }
    if (code.length > 100_000) {
      throw createError('Code exceeds the 100 KB limit.', 400)
    }

    const upstream = await fetch(COMPILER_API, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ compiler, code, input }),
      signal: AbortSignal.timeout(35_000),
    })

    if (upstream.status === 429) {
      return res.status(429).json({
        error: 'The code execution service is at capacity. Please try again in a moment.',
      })
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '')
      throw createError(`Code execution service error: ${upstream.status} ${text}`, 502)
    }

    const data = await upstream.json()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listCompilers(_req: Request, res: Response) {
  res.json({ compilers: SUPPORTED_COMPILERS })
}
