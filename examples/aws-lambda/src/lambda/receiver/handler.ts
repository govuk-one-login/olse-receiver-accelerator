import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/publicKey/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstSchemas } from '../../../../../src/vendor/validateSchema/validateSchema'
import { handleSignalRouting } from '../../../../../common/signalRouting/signalRouter'
import { httpErrorResponseMessages } from '../../../../../common/constants'
import { ConfigurationKeys } from '../../../../../common/config/configurationKeys'
import { getParameter } from '../../../../../common/ssm/ssm'
import { getEnv } from '../../mock-transmitter/utils'
import { lambdaLogger as logger } from '../../../../../common/logging/logger'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Received event:', { event })
    const jwt = event.body
    logger.info('Processing signal receiver request')
    if (!jwt) {
      logger.error('No JWT found in request body')
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
    const secretArn = process.env['RECEIVER_SECRET_ARN']
    if (!secretArn) {
      logger.error('RECEIVER_SECRET_ARN environment variable is not set')
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          err: 'internal_error',
          description: 'RECEIVER_SECRET_ARN environment variable is required'
        })
      }
    }

    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME)
    const jwksUrl = await getParameter(`/${stackName}/jwks-url`)

    const publicKey = getPublicKeyFromRemote(jwksUrl)
    logger.debug('Fetched public key from JWKS URL')

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

    const schemaValidationResult =
      await validateSignalAgainstSchemas(jwtPayload)

    logger.debug('Schema validation result:', { schemaValidationResult })
    if (!schemaValidationResult.valid) {
      logger.warn('Schema validationg failed', { Error })
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_request)
      }
    }
    logger.info('Schema validated successfully')

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
