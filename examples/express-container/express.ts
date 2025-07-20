import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import { readFileSync } from 'fs'
import * as jose from 'jose'
import { auth } from '../../src/vendor/auth/auth'
import { getPublicKeyFromRemote } from '../../src/vendor/getPublicKey'
import {
  validateJWT,
  validateJWTWithRemoteKey
} from '../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstSchemas } from '../../src/vendor/validateSchema'
import { handleSignalRouting } from './signalRouting/signalRouter'
import { httpErrorResponseMessages } from './constants'
import { startVerificationSignals } from './verification/scheduler'
import { handleVerificationEvent } from './verification/verification-jwt'

// app.use(express.json())
const app = express()
const v1Router = express()

v1Router.post(
  '/token',
  bodyParser.urlencoded({ extended: true }),
  async (req: Request, res: Response) => {
    const authResponse = await auth(req)
    if (authResponse.valid) {
      res.status(200).type('json').json(authResponse.data)
    } else {
      const responseError = { error: authResponse.error }
      res.status(authResponse.response_code).type('json').json(responseError)
    }
  }
)

v1Router.post(
  '/Events',
  bodyParser.text({ type: ['application/secevent+jwt', 'text/plain'] }),
  async (req: Request, res: Response) => {
    const auth_header = req.headers.authorization

    if (
      !auth_header?.startsWith('Bearer ') ||
      typeof auth_header === 'undefined'
    ) {
      res.status(401).json({ error: 'Unauthorised access' })
      return
    }

    try {
      const accessToken = auth_header.substring(7)
      const publicKeyString = readFileSync('./keys/authPublic.key', {
        encoding: 'utf8'
      })
      // eslint-disable-next-line
      const publicKeyJson = JSON.parse(publicKeyString as any)
      const key = await jose.importJWK(publicKeyJson as jose.JWK, 'PS256')
      await validateJWT(accessToken, key)
    } catch {
      res.status(401).json({ error: 'Unauthorised access' })
      return
    }

    const publicKey = getPublicKeyFromRemote('wwww.example.com')

    let verifiedJwtBody
    try {
      // eslint-disable-next-line
      const jwt = req.body
      verifiedJwtBody = await validateJWTWithRemoteKey(jwt as string, publicKey)
    } catch (error) {
      console.error('failed to validate JWT with remote key')
      console.error(error)
      res.status(400).json(httpErrorResponseMessages.invalid_key)
    }

    const jwtPayload = verifiedJwtBody?.payload

    if (typeof jwtPayload === 'undefined') {
      res.type('json').status(400).json({
        err: 'invalid_request',
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      })
      return
    }

    const schemaValidationResult =
      await validateSignalAgainstSchemas(jwtPayload)

    if (!schemaValidationResult.valid) {
      res
        .type('json')
        .status(400)
        .json(httpErrorResponseMessages.invalid_request)
      return
    }

    const verificationResult = await handleVerificationEvent(jwtPayload);
    if (!verificationResult.valid) {
      console.error('Verification event state validation failed')
      res.type('json').status(400).json({
        err: verificationResult.error ?? 'invalid_state',
        description: 'State value in verification event is invalid or expired'
      })
      return
    }

    const result = handleSignalRouting(
      jwtPayload,
      schemaValidationResult.schema
    )
    if (result.valid) {
      res.status(202).send()
      return
    } else {
      console.error('failed to route signal')
      res
        .type('json')
        .status(400)
        .json(httpErrorResponseMessages.invalid_request)
      return
    }
  }
)

app.use('/v1', v1Router)
startVerificationSignals()

export { app };
