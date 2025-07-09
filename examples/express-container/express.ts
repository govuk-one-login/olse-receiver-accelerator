import express, { Request, Response } from 'express'
// import { auth } from '../../src/auth/auth'

const app = express()
const v1Router = express()

v1Router.get('/auth', (req: Request, res: Response) => {
  const v = 'fax'
  res.json({ hello: v, time: new Date().toISOString() })
  console.log(v)
})

app.use('/v1', v1Router)

export { app }
