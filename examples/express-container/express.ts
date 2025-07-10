import express, { Request, Response } from 'express'
import { validateSignalAgainstSchemas } from '../../src/vendor/validateSchema'
import bodyParser from 'body-parser'
import { validateJWT } from '../../src/vendor/validateJWT'

const app = express()
const v1Router = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

v1Router.get('/:id', (req: Request, res: Response) => {
  res.json({ id: Number(req.params['id']) })
})

v1Router.post('/Events', async (req: Request, res: Response) => {
  // eslint-disable-next-line
  const verifiedJwtBody = await validateJWT(req.body.jwt, req.body.publicKey)
  const schemsIsValid = await validateSignalAgainstSchemas(verifiedJwtBody)
  if (schemsIsValid.valid) {
    res.status(202)
  } else {
    res.status(400).send('Invalid signal, no schema matches found.')
  }
})

app.use('/v1', v1Router)

export { app }
