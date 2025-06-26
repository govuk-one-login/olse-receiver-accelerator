import express, { Request, Response } from 'express'

const app = express()
const v1Router = express()

v1Router.get('/:id', (req: Request, res: Response) => {
  res.json({ id: Number(req.params['id']) })
})

app.use('/v1', v1Router)

export { app }
