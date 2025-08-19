import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstSchemas } from '../../../../../src/vendor/validateSchema'
import { handleSignalRouting } from '../../../../../common/signalRouting/signalRouter'
import { httpErrorResponseMessages } from '../../../../../common/constants'
import { logger } from '../../../../../common/logging/logger'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const jwt = event.body
    logger.info('Processing signal receiver request')
    if (!jwt) {
      logger.warn('Request missing body')
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          err: 'invalid_request',
          description: 'Request body is required'
        })
      }
    }

    const jwksUrl = process.env['JWKS_URL']
    if (!jwksUrl) {
      logger.error('Missing JWKS_URL enviornment variable', {
        variable: 'JWKS_URL'
      })
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          err: 'internal_error',
          description: 'JWKS_URL environment variable is required'
        })
      }
    }

    logger.debug('Retriving public key', { jwksUrl })
    const publicKey = getPublicKeyFromRemote(jwksUrl)

    let verifiedJwtBody
    try {
      logger.debug('Validating JWT with remote key')
      verifiedJwtBody = await validateJWTWithRemoteKey(jwt, publicKey)
      logger.info('JWK validation successful')
    } catch (error) {
      logger.error('failed to validate JWT with remote key', {
        error: error instanceof Error ? error.message : String(error)
      })
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_key)
      }
    }

    const jwtPayload = verifiedJwtBody.payload

    if (typeof jwtPayload === 'undefined') {
      logger.warn('JWT payload is undefined')
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          err: 'invalid_request',
          description:
            "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
        })
      }
    }

    logger.debug('Validating signal against schemas')
    const schemaValidationResult =
      await validateSignalAgainstSchemas(jwtPayload)

    if (!schemaValidationResult.valid) {
      logger.warn('Schema validationg failed', { Error })
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_request)
      }
    }
    logger.info('Schema validated successfully')

    logger.debug('Routing signal', { schema: schemaValidationResult.schema })
    const result = await handleSignalRouting(
      jwtPayload,
      schemaValidationResult.schema
    )

    if (result.valid) {
      logger.info('Signal routing processed successfully')
      return {
        statusCode: 202,
        headers: { 'Content-Type': 'application/json' },
        body: ''
      }
    } else {
      logger.error('failed to route signal')
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_request)
      }
    }
  } catch (error) {
    logger.error('Unexpected error in receiver handler:', {
      error: error instanceof Error ? error.message : String(error)
    })
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        err: 'internal_error',
        description: 'An internal error occurred'
      })
    }
  }
}
