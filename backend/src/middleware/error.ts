import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  requiredPlan?: 'pro' | 'ultimate'
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500
  const message = err.message ?? 'Internal server error'

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error ${statusCode}]`, err)
  }

  res.status(statusCode).json({
    error: message,
    ...(err.code ? { code: err.code } : {}),
    ...(err.requiredPlan ? { requiredPlan: err.requiredPlan } : {}),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export function createError(
  message: string,
  statusCode: number,
  extra?: { code?: string; requiredPlan?: 'pro' | 'ultimate' },
): AppError {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  if (extra?.code) err.code = extra.code
  if (extra?.requiredPlan) err.requiredPlan = extra.requiredPlan
  return err
}
