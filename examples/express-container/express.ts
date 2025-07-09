import express, { Request, Response } from 'express'
import { auth } from '../../src/auth/auth'

const app = express()
const v1Router = express()

v1Router.get('/auth', (req: Request, res: Response) => {
  auth(req, res)
})

app.use('/v1', v1Router)

export { app }
