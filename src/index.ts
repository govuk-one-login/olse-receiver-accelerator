import express, { Request, Response } from 'express'

const port = process.env['PORT'] ?? 3000

const app = express()
const v1Router = express()

v1Router.get('/:id', (req: Request, res: Response) => {
  res.json({ userId: req.params['id'], name: req.params['id'] })
})

app.use('/v1', v1Router)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port.toString()}`)
})
