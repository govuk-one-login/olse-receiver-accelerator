import { Request } from 'express'

export const getAuthInput = (req: Request) => {
  const client_id = req.query['client_id'] as string
  const client_secret = req.query['client_secret'] as string
  const grant_type = req.query['grant_type'] as string
  return { client_id, client_secret, grant_type }
}
