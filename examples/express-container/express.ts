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
import { startHealthCheck } from './verification/startHealthCheck'

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
    try {
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

      const jwksUrl = process.env['JWKS_URL']
      if (!jwksUrl) {
        res
          .status(500)
          .json({ error: 'JWKS_URL environment variable is required' })
        return
      }
      const publicKey = getPublicKeyFromRemote(jwksUrl)

      let verifiedJwtBody
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const jwt = req.body
        verifiedJwtBody = await validateJWTWithRemoteKey(
          jwt as string,
          publicKey
        )
      } catch (error) {
        console.error('failed to validate JWT with remote key')
        console.error(error)
        res.status(400).json(httpErrorResponseMessages.invalid_key)
        return
      }

      const jwtPayload = verifiedJwtBody.payload

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

      const result = await handleSignalRouting(
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
    } catch (error) {
      console.error('Unexpected error in /Events endpoint:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

app.use('/v1', v1Router)
startHealthCheck()

export { app }
