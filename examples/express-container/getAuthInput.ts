import { Request } from 'express'

export const getAuthInput = (req: Request) => {
  const client_id = req.query['client_id']
  const client_secret = req.query['client_secret']
  const grant_type = req.query['grant_type']
  return { client_id, client_secret, grant_type }
}
