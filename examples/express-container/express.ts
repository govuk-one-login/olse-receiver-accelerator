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
import { CustomSetErrorCode } from './enums/enums'
import { SetPayload } from './interfaces/interfaces'
import { handleSignalRouting } from './signal-routing/signal-route-handler'
import { sendSignalResponse } from './utils/response-helper'

// app.use(express.json())
const app = express()
const v1Router = express()

function signalEventHandler(req: Request, res: Response): void {
  try {
    // Auth handler

    // Validation handler

    // Routing handler
    const signalPayload: SetPayload = req.body as SetPayload
    const result = handleSignalRouting(signalPayload)

    if (result.success) {
      sendSignalResponse(res, true)
    } else {
      sendSignalResponse(
        res,
        false,
        result.errorCode,
        result.message,
        result.statusCode
      )
    }
  } catch (err) {
    console.error('Error processing request:', err)
    sendSignalResponse(
      res,
      false,
      CustomSetErrorCode.FAILED_TO_PROCESS,
      'Failed to process the request',
      500
    )
  }
}

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
      console.error(error)
      res.status(400).json({
        err: 'invalid_key',
        description:
          'One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.).'
      })
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
      res.type('json').status(400).json({
        err: 'invalid_request',
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      })
      return
    }
      res.status(202).send()
    } else {
      console.error('Invalid signal, no schema matches found.')
      res.type('json').status(400).json({
        err: 'invalid_request',
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      })
    }
  }
)

app.use('/v1', v1Router)
export { app }
