import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstEmbeddedSchemas } from '../../../../../src/vendor/validateSchema'
import { handleSignalRoutingByEventType } from '../../../../../common/signalRouting/signalRouter'
import { httpErrorResponseMessages } from '../../../../../common/constants'
import { decodeProtectedHeader } from 'jose'
import { ConfigurationKeys } from '../../../../express-container/config/ConfigurationKeys'
import { getParameter } from '../../../../../common/ssm/ssm'
import { getEnv } from '../../mock-transmitter/utils'
import { lambdaLogger as logger } from '../../../../../common/logging/logger'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received event:', event)
    const jwt = event.body
    logger.info('Processing signal receiver request')
    if (!jwt) {
      console.error('No JWT found in request body')
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

    // const jwksUrl = process.env['JWKS_URL']
    // console.log('Using JWKS URL:', jwksUrl)
    // if (!jwksUrl) {
    //   console.log('JWKS_URL environment variable is not set')
    //   return {
    //     statusCode: 500,
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       err: 'internal_error',
    //       description: 'JWKS_URL environment variable is required'
    //     })
    //   }
    // }
    const secretArn = process.env['RECEIVER_SECRET_ARN']
    if (!secretArn) {
      console.error('RECEIVER_SECRET_ARN environment variable is not set')
      logger.error('Missing JWKS_URL enviornment variable', {
        variable: 'JWKS_URL'
      })
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

    const header = decodeProtectedHeader(jwt)
    console.log('JWT Header:', header)
    console.log('JWT kid:', header.kid)
    console.log('JWT alg:', header.alg)

    console.log('Received JWT:', jwt)
    console.log('Fetching JWKS from URL:', jwksUrl)
    console.log('Fetching JWKS from URL:', jwksUrl)

    const jwksResponse = await fetch(jwksUrl)
    const jwks = await jwksResponse.json()
    console.log('Fetched JWKS:', jwks)
    console.log('FULL jwksResponse:', jwksResponse)

    const publicKey = getPublicKeyFromRemote(jwksUrl)
    console.log('Fetched public key from JWKS URL')

    let verifiedJwtBody
    try {
      console.log('Validating JWT with remote key')
      logger.debug('Validating JWT with remote key')
      verifiedJwtBody = await validateJWTWithRemoteKey(jwt, publicKey)
      console.log('JWT successfully validated')
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
    console.log('JWT Payload:', jwtPayload)
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

    // const schemaValidationResult =
    //   await validateSignalAgainstSchemas(jwtPayload)

    const schemaValidationResult =
      await validateSignalAgainstEmbeddedSchemas(jwtPayload)
    console.log('Schema validation result:', schemaValidationResult)
    if (!schemaValidationResult.valid) {
      logger.warn('Schema validationg failed', { Error })
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_request)
      }
    }
    logger.info('Schema validated successfully')

    const result = await handleSignalRoutingByEventType(jwtPayload)

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
