import { Request } from 'express'

export interface SetPayload {
  iss?: string
  aud?: string | string[]
  iat?: number
  jti?: string
  sub?: string
  events?: Record<string, object>
  txn?: string
  toe?: number
}

export interface SetRequest extends Request {
  body: SetPayload
}

export interface SetErrorResponse {
  error: string
  description: string
}
