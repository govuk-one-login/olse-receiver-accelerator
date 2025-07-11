import { Response } from 'express'
import { SetErrorCode } from '../types/types'

export function sendSignalResponse(
  res: Response,
  success: boolean,
  errorCode?: SetErrorCode,
  description?: string
): Response {
  if (success) {
    return res.status(200).json({ success: true })
  }

  return res.status(400).set('Content-Type', 'application/json').json({
    err: errorCode,
    description: description
  })
}
