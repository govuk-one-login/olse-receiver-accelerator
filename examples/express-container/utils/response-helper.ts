import { Response } from 'express'

export function sendSignalResponse(
  res: Response,
  success: boolean,
  errorCode?: string,
  description?: string,
  statusCode?: number
): Response {
  if (success) {
    return res.status(202)
  }

  return res.status(statusCode || 400).set('Content-Type', 'application/json').json({
    err: errorCode,
    description: description
  })
}
