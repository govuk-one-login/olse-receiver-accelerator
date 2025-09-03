import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstEmbeddedSchemas } from '../../../../../src/vendor/validateSchema'
import { handleSignalRouting } from '../../../../../common/signalRouting/signalRouter'
import { httpErrorResponseMessages } from '../../../../../common/constants'
import { decodeProtectedHeader } from 'jose'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received event:', event)
    const jwt = event.body
    if (!jwt) {
      console.error('No JWT found in request body')
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
    console.log('Using JWKS URL:', jwksUrl)
    if (!jwksUrl) {
      console.log('JWKS_URL environment variable is not set')
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          err: 'internal_error',
          description: 'JWKS_URL environment variable is required'
        })
      }
    }
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
      verifiedJwtBody = await validateJWTWithRemoteKey(jwt, publicKey)
      console.log('JWT successfully validated')
    } catch (error) {
      console.error('failed to validate JWT with remote key')
      console.error(error)
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_key)
      }
    }

    const jwtPayload = verifiedJwtBody.payload
    console.log('JWT Payload:', jwtPayload)
    if (typeof jwtPayload === 'undefined') {
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

    if (!schemaValidationResult.valid) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_request)
      }
    }

    const result = await handleSignalRouting(
      jwtPayload,
      schemaValidationResult.schema
    )

    if (result.valid) {
      return {
        statusCode: 202,
        headers: { 'Content-Type': 'application/json' },
        body: ''
      }
    } else {
      console.error('failed to route signal')
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(httpErrorResponseMessages.invalid_request)
      }
    }
  } catch (error) {
    console.error('Unexpected error in receiver handler:', error)
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
