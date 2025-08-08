import { when } from 'jest-when'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstSchemas } from '../../../../../src/vendor/validateSchema'
import { handleSignalRouting } from '../../../../express-container/signalRouting/signalRouter'
import { handler } from './handler'

jest.mock('../../../../../src/vendor/getPublicKey')
jest.mock('../../../../../src/vendor/jwt/validateJWT')
jest.mock('../../../../../src/vendor/validateSchema')
jest.mock('../../../../express-container/signalRouting/signalRouter')

const mockEvent: APIGatewayProxyEvent = {
  body: 'mock.jwt.token',
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: '/receiver',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  requestContext: {} as any,
  resource: ''
}

const mockJwtPayload = {
  sub_id: { format: 'opaque', id: 'test-id' },
  events: {
    'https://schemas.openid.net/secevent/ssf/event-type/verification': {
      state: 'test-state'
    }
  }
}

describe('receiver handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(console, 'error').mockImplementation()
    process.env['JWKS_URL'] = 'https://example.com/jwks'
  })

  it('returns 400 when request body is missing', async () => {
    const eventWithoutBody = { ...mockEvent, body: null }

    const result = await handler(eventWithoutBody)

    expect(result).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        err: 'invalid_request',
        description: 'Request body is required'
      })
    })
  })

  it('returns 400 when JWT validation fails', async () => {
    when(getPublicKeyFromRemote).mockReturnValue(
      {} as ReturnType<typeof getPublicKeyFromRemote>
    )
    when(validateJWTWithRemoteKey).mockRejectedValue(new Error('Invalid JWT'))

    const result = await handler(mockEvent)

    expect(result).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        err: 'invalid_key',
        description:
          'One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.).'
      })
    })
    expect(console.error).toHaveBeenCalledWith(
      'failed to validate JWT with remote key'
    )
  })

  it('returns 400 when JWT payload is undefined', async () => {
    when(getPublicKeyFromRemote).mockReturnValue(
      {} as ReturnType<typeof getPublicKeyFromRemote>
    )
    when(validateJWTWithRemoteKey).mockResolvedValue({
      payload: undefined,
      protectedHeader: {},
      key: {}
    } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)

    const result = await handler(mockEvent)

    expect(result).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        err: 'invalid_request',
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      })
    })
  })

  it('returns 400 when schema validation fails', async () => {
    when(getPublicKeyFromRemote).mockReturnValue(
      {} as ReturnType<typeof getPublicKeyFromRemote>
    )
    when(validateJWTWithRemoteKey).mockResolvedValue({
      payload: mockJwtPayload,
      protectedHeader: {},
      key: {}
    } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)
    when(validateSignalAgainstSchemas).mockResolvedValue({
      valid: false,
      message: 'Invalid schema'
    })

    const result = await handler(mockEvent)

    expect(result).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        err: 'invalid_request',
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      })
    })
  })

  it('returns 400 when signal routing fails', async () => {
    when(getPublicKeyFromRemote).mockReturnValue(
      {} as ReturnType<typeof getPublicKeyFromRemote>
    )
    when(validateJWTWithRemoteKey).mockResolvedValue({
      payload: mockJwtPayload,
      protectedHeader: {},
      key: {}
    } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)
    when(validateSignalAgainstSchemas).mockResolvedValue({
      valid: true,
      schema: 'test-schema'
    })
    when(handleSignalRouting).mockResolvedValue({
      valid: false
    })

    const result = await handler(mockEvent)

    expect(result).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        err: 'invalid_request',
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      })
    })
    expect(console.error).toHaveBeenCalledWith('failed to route signal')
  })

  it('returns 202 when signal processing succeeds', async () => {
    when(getPublicKeyFromRemote).mockReturnValue(
      {} as ReturnType<typeof getPublicKeyFromRemote>
    )
    when(validateJWTWithRemoteKey).mockResolvedValue({
      payload: mockJwtPayload,
      protectedHeader: {},
      key: {}
    } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)
    when(validateSignalAgainstSchemas).mockResolvedValue({
      valid: true,
      schema: 'test-schema'
    })
    when(handleSignalRouting).mockResolvedValue({
      valid: true,
      schema: 'test-schema'
    })

    const result = await handler(mockEvent)

    expect(result).toEqual({
      statusCode: 202,
      headers: { 'Content-Type': 'application/json' },
      body: ''
    })
    expect(handleSignalRouting).toHaveBeenCalledWith(
      mockJwtPayload,
      'test-schema'
    )
  })

  it('returns 500 when unexpected error occurs', async () => {
    when(getPublicKeyFromRemote).mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const result = await handler(mockEvent)

    expect(result).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        err: 'internal_error',
        description: 'An internal error occurred'
      })
    })
    expect(console.error).toHaveBeenCalledWith(
      'Unexpected error in receiver handler:',
      expect.any(Error)
    )
  })
})
