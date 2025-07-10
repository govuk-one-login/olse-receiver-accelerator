import express, { Request, Response } from 'express'
// import { auth } from '../../src/auth/auth'

const getClientCredentials = (req: Request) => {
  const client_id = req.query['client_id']
  const client_secret = req.query['client_secret']
  return { client_id, client_secret }
}

const app = express()
const v1Router = express()

v1Router.post('/token', (req: Request, res: Response) => {
  const v = 'hello'
  res.json({ hello: v, time: new Date().toISOString() })
  console.log(v)
  const { client_id, client_secret } = getClientCredentials()
  if ()
})

app.use('/v1', v1Router)

export { app, getClientCredentials }
