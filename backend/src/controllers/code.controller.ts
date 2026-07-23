import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/error'
import { CodeExecutionLog } from '../models/code-execution-log.model'
import { CodeBan } from '../models/code-ban.model'
import { getLimits } from '../config/plans'

// Max source-code size stored for history (8 KB — keeps DB lean)
const MAX_STORED_CODE = 8_192

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
    const userId = req.user!.id

    // ── Check plan daily limit ────────────────────────────────────────────────
    const userPlan = req.user!.plan
    const dailyLimit = getLimits(userPlan).codeExecutionsPerDay
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayCount = await CodeExecutionLog.countDocuments({
      userId, status: 'success', createdAt: { $gte: todayStart },
    })
    if (todayCount >= dailyLimit) {
      return res.status(429).json({
        error: 'DAILY_LIMIT_REACHED',
        limit: dailyLimit,
        used: todayCount,
        plan: userPlan,
        message: `You've used all ${dailyLimit} code executions for today. Upgrade your plan to get more.`,
      })
    }

    // ── Check if user is banned from code execution ──────────────────────────
    const ban = await CodeBan.findOne({ userId }).lean()
    if (ban) {
      return res.status(403).json({
        banned: true,
        error: ban.reason
          ? `Your code execution access has been revoked by an administrator. Reason: ${ban.reason}`
          : 'Your code execution access has been revoked by an administrator. Please contact support.',
      })
    }

    const apiKey = process.env.ONLINE_COMPILER_API_KEY
    if (!apiKey) throw createError('Code execution is not configured on this server.', 503)

    const { compiler, code, input = '', problemSlug } = req.body as {
      compiler: string
      code: string
      input?: string
      problemSlug?: string
    }

    if (!compiler || !VALID_COMPILERS.has(compiler as never)) {
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

    const data = await upstream.json() as {
      status?: string; exit_code?: number; time?: string; total?: string; memory?: string
    }

    // ── Log execution ─────────────────────────────────────────────────────────
    const isSuccess = (data.exit_code ?? 0) === 0
    const storedCode = code.length > MAX_STORED_CODE
      ? code.slice(0, MAX_STORED_CODE) + '\n// [truncated — code exceeded 8 KB storage limit]'
      : code
    CodeExecutionLog.create({
      userId,
      language:    compiler,
      status:      isSuccess ? 'success' : 'error',
      exitCode:    data.exit_code ?? 0,
      executionMs: Math.round(parseFloat(data.time ?? '0') * 1000),
      memoryKb:    parseInt(data.memory ?? '0', 10),
      codeLength:  code.length,
      code:        storedCode,
      ...(problemSlug ? { problemSlug } : {}),
    }).catch(() => { /* non-fatal — never block the response */ })

    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listCompilers(_req: Request, res: Response) {
  res.json({ compilers: SUPPORTED_COMPILERS })
}

// ── GET /code/history ─────────────────────────────────────────────────────────
// Returns the current user's paginated run history (newest first).
// Query params: problemSlug? (filter by problem), page (default 1), limit (default 20, max 50)
export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const { problemSlug, page = '1', limit = '20' } = req.query as {
      problemSlug?: string; page?: string; limit?: string
    }

    const pageNum  = Math.max(1, parseInt(page, 10)  || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20))
    const skip     = (pageNum - 1) * limitNum

    const filter: Record<string, unknown> = { userId }
    if (problemSlug) filter.problemSlug = problemSlug

    const [runs, total] = await Promise.all([
      CodeExecutionLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('language status exitCode executionMs memoryKb codeLength code problemSlug createdAt')
        .lean(),
      CodeExecutionLog.countDocuments(filter),
    ])

    res.json({ runs, total, page: pageNum, pages: Math.ceil(total / limitNum) })
  } catch (err) {
    next(err)
  }
}
