import express, { Request, Response } from 'express'
import { auth } from '../../src/auth/auth'

const app = express()
const v1Router = express()

v1Router.post('/token', async (req: Request, res: Response) => {
  const authResponse = await auth(req)
  if (authResponse.valid) {
    res.status(200).type('json').json(authResponse.data)
  } else {
    const responseError = { error: authResponse.error }
    res.status(authResponse.response_code).type('json').json(responseError)
  }
})

app.use('/v1', v1Router)

export { app }
