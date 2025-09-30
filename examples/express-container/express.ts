import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import { readFileSync } from 'fs'
import * as jose from 'jose'
import { auth } from '../../src/vendor/auth/auth'
import { getPublicKeyFromRemote } from '../../src/vendor/publicKey/getPublicKey'
import {
  validateJWT,
  validateJWTWithRemoteKey
} from '../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstSchemas } from '../../src/vendor/validateSchema/validateSchema'
import { handleSignalRouting } from '../../common/signalRouting/signalRouter'
import { httpErrorResponseMessages } from '../../common/constants'
import { startHealthCheck } from './verification/startHealthCheck'
import { baseLogger as logger } from '../../common/logging/logger'
import { config } from '../../common/config/config'
import { ConfigurationKeys } from '../../common/config/configurationKeys'

const app = express()
const v1Router = express()

v1Router.post(
  '/token',
  bodyParser.urlencoded({ extended: true }),
  async (req: Request, res: Response) => {
    logger.info('Processing token request', {
      path: req.path
    })
    const authResponse = await auth(req)
    if (authResponse.valid) {
      logger.info('Token request successful')
      res.status(200).type('json').json(authResponse.data)
    } else {
      logger.warn('Token request failed', {
        Error,
        responseCode: authResponse.response_code
      })
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
      logger.info('Processing events request', { path: req.path })
      const auth_header = req.headers.authorization

      if (
        !auth_header?.startsWith('Bearer ') ||
        typeof auth_header === 'undefined'
      ) {
        logger.warn('Missing authorization header')
        res.status(401).json({ error: 'Unauthorised access' })
        return
      }

      try {
        logger.debug('Validating access token')
        const accessToken = auth_header.substring(7)
        const publicKeyString = readFileSync('./keys/authPublic.key', {
          encoding: 'utf8'
        })
        const publicKeyJson = JSON.parse(publicKeyString) as jose.JWK
        const key = await jose.importJWK(publicKeyJson, 'RS256')
        await validateJWT(accessToken, key)
        logger.debug('Access token validation successful')
      } catch (error) {
        logger.warn('Access token validation failed', { error })
        res.status(401).json({ error: 'Unauthorised access' })
        return
      }

      const jwksUrl = config.get(ConfigurationKeys.JWKS_URL)
      if (!jwksUrl) {
        logger.error('Missing JWKS_URL environment variable')
        res
          .status(500)
          .json({ error: 'JWKS_URL environment variable is required' })
        return
      }

      logger.debug('Retriving public key', { jwksUrl })
      const publicKey = getPublicKeyFromRemote(jwksUrl)

      let verifiedJwtBody
      try {
        logger.debug('Validating JWT with remote key')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const jwt = req.body
        verifiedJwtBody = await validateJWTWithRemoteKey(
          jwt as string,
          publicKey
        )
        logger.info('JWT validation successful')
      } catch (error) {
        logger.error('Failed to validate JWT with remote key', {
          error: error instanceof Error ? error.message : String(error)
        })
        res.status(400).json(httpErrorResponseMessages.invalid_key)
        return
      }

      const jwtPayload = verifiedJwtBody.payload

      if (typeof jwtPayload === 'undefined') {
        logger.warn('JWT payload is undefined')
        res.type('json').status(400).json({
          err: 'invalid_request',
          description:
            "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
        })
        return
      }

      logger.debug('Validating signal against schema')
      const schemaValidationResult =
        await validateSignalAgainstSchemas(jwtPayload)

      if (!schemaValidationResult.valid) {
        logger.warn('Schema validation failed')
        res
          .type('json')
          .status(400)
          .json(httpErrorResponseMessages.invalid_request)
        return
      }

      logger.info('Schema validation successful')

      logger.debug('Routing signal')
      const result = await handleSignalRouting(
        jwtPayload,
        schemaValidationResult.schema
      )
      if (result.valid) {
        logger.info('Signal routing completed successfully')
        res.status(202).send()
        return
      } else {
        logger.error('failed to route signal', {
          message: httpErrorResponseMessages.invalid_request
        })
        res
          .type('json')
          .status(400)
          .json(httpErrorResponseMessages.invalid_request)
        return
      }
    } catch (error) {
      logger.error('Unexpected error in /Events endpoint:', {
        error: error instanceof Error ? error.message : String(error)
      })
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

v1Router.get('/health-check', (_req: Request, res: Response) => {
  try {
    startHealthCheck()
    res.status(200).json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : String(err)
    })
  }
})

app.use('/v1', v1Router)

export { app }
