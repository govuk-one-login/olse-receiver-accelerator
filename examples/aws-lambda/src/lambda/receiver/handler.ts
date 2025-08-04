import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstSchemas } from '../../../../../src/vendor/validateSchema'
import { handleSignalRouting } from '../../../../express-container/signalRouting/signalRouter'
import { httpErrorResponseMessages } from '../../../../express-container/constants'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const jwt = event.body
    if (!jwt) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          err: 'invalid_request',
          description: 'Request body is required'
        })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const publicKey = getPublicKeyFromRemote(process.env['JWKS_URL']!)

    let verifiedJwtBody
    try {
      verifiedJwtBody = await validateJWTWithRemoteKey(jwt, publicKey)
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

    const schemaValidationResult = await validateSignalAgainstSchemas(jwtPayload)

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
