import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { auth } from '../../src/auth/auth'
import { getPublicKey } from './getPublicKey'
import { validateJWT } from '../../src/vendor/validateJWT'
import { validateSignalAgainstSchemas } from '../../src/vendor/validateSchema'

const app = express()
const v1Router = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

v1Router.post('/token', async (req: Request, res: Response) => {
  const authResponse = await auth(req)
  if (authResponse.valid) {
    res.status(200).type('json').json(authResponse.data)
  } else {
    const responseError = { error: authResponse.error }
    res.status(authResponse.response_code).type('json').json(responseError)
  }
})

v1Router.post('/Events', async (req: Request, res: Response) => {
  const publicKey = await getPublicKey('wwww.example.com')
  console.log(publicKey)
  let verifiedJwtBody
  try {
    // eslint-disable-next-line
    verifiedJwtBody = await validateJWT(req.body.jwt, publicKey)
  } catch (error) {
    res
      .status(400)
      .type('json')
      .json({ error, message: 'Invalid JWT, JWT could not be verified.' })
  }
  const schemsIsValid = await validateSignalAgainstSchemas(
    verifiedJwtBody?.payload
  )
  if (schemsIsValid?.valid) {
    res.status(202).type('json').json(schemsIsValid)
  } else {
    res
      .status(400)
      .type('json')
      .json({ message: 'Invalid signal, no schema matches found.' })
  }
})

app.use('/v1', v1Router)

export { app }
