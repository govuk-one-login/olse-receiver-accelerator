import { Request, Response } from 'express'
import { generateJWT } from './jwt'

const auth = async (req: Request, res: Response) => {
  const client_id = req.query['client_id']
  const client_secret = req.query['client_secret']

  if (
    client_id === process.env['CLIENT_ID'] &&
    client_secret === process.env['CLIENT_SECRET']
  ) {
    try {
      const token = await generateJWT()
      res.json({ token })
    } catch (error) {
      console.error('Error generating JWT:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
    return
  }

  res.status(403).send('Forbidden')
}

export { auth }
