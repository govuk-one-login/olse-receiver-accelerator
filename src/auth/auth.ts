import { Request, Response } from 'express'

const auth = (req: Request, res: Response) => {
  const client_id = req.query['client_id']
  const client_secret = req.query['client_secret']

  if (
    client_id === process.env['CLIENT_ID'] &&
    client_secret === process.env['CLIENT_SECRET']
  ) {
    res.send(200)
    return
  }

  res.status(403).send('Forbidden')
}

export { auth }
