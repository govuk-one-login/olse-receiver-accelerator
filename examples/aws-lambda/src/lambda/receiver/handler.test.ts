import { APIGatewayProxyEvent } from 'aws-lambda'
import * as jose from 'jose'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/publicKey/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstEmbeddedSchemas } from '../../../../../src/vendor/validateSchema/validateSchema'
import { handleSignalRoutingByEventType } from '../../../../../common/signalRouting/signalRouter'
import { handler } from './handler'
import { getParameter } from '../../../../../common/ssm/ssm'
import { lambdaLogger } from '../../../../../common/logging/logger'

jest.mock('../../../../../src/vendor/publicKey/getPublicKey')
jest.mock('../../../../../src/vendor/jwt/validateJWT')
jest.mock('../../../../../src/vendor/validateSchema/validateSchema')
jest.mock('../../../../../common/signalRouting/signalRouter')
jest.mock('../../../../../common/ssm/ssm')
jest.mock('../../../../../common/logging/logger', () => ({
  lambdaLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}))

type VerifyResult = Awaited<ReturnType<typeof validateJWTWithRemoteKey>>

const mockGetPublicKeyFromRemote = jest.mocked(getPublicKeyFromRemote)
const mockValidateJWTWithRemoteKey = jest.mocked(validateJWTWithRemoteKey)
const mockValidateSignalAgainstEmbeddedSchemas = jest.mocked(
  validateSignalAgainstEmbeddedSchemas
)
const mockHandleSignalRoutingByEventType = jest.mocked(
  handleSignalRoutingByEventType
)
const mockGetParameter = jest.mocked(getParameter)

global.fetch = jest.fn() as unknown as typeof fetch
const mockFetch = jest.mocked(global.fetch)

const mockJwtPayload = {
  sub_id: { format: 'opaque', id: 'test-id' },
  events: {
    'https://schemas.openid.net/secevent/ssf/event-type/verification': {
      state: 'test-state'
    }
  }
}

const baseEvent: Partial<APIGatewayProxyEvent> = {
  body: '1.2.3',
  requestContext: {
    requestId: 'test-request-id-001'
  } as unknown as APIGatewayProxyEvent['requestContext']
}

let warnSpy: jest.SpyInstance
let errorSpy: jest.SpyInstance

describe('receiver handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    warnSpy = jest.spyOn(lambdaLogger, 'warn')
    errorSpy = jest.spyOn(lambdaLogger, 'error')

    process.env['RECEIVER_SECRET_ARN'] = 'test-arn'
    process.env['AWS_STACK_NAME'] = 'test-stack'

    mockGetParameter.mockResolvedValue('https://test.com/jwks')

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ keys: [] })
    } as unknown as Response)

    const realRemoteJwks = jose.createRemoteJWKSet(
      new URL('https://test.com/jwks')
    )
    mockGetPublicKeyFromRemote.mockReturnValue(realRemoteJwks)
  })

  afterEach(() => {
    delete process.env['RECEIVER_SECRET_ARN']
    delete process.env['AWS_STACK_NAME']
  })

  it('returns 400 when request body is missing', async () => {
    const event = { ...baseEvent, body: null }
    const result = await handler(event as APIGatewayProxyEvent)
    expect(result.statusCode).toBe(400)
    expect(warnSpy).toHaveBeenCalledWith('Request missing body')
  })

  it('returns 400 when JWT validation fails', async () => {
    mockValidateJWTWithRemoteKey.mockRejectedValue(new Error('Invalid JWT'))
    const result = await handler(baseEvent as APIGatewayProxyEvent)
    expect(result.statusCode).toBe(400)
  })

  it('returns 400 when JWT payload is undefined', async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      payload: undefined,
      protectedHeader: { alg: 'RS256' },
      key: new Uint8Array()
    } as unknown as VerifyResult)
    const result = await handler(baseEvent as APIGatewayProxyEvent)
    expect(result.statusCode).toBe(400)
    expect(warnSpy).toHaveBeenCalledWith('JWT payload is undefined')
  })

  it('returns 400 when schema validation fails', async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      payload: mockJwtPayload,
      protectedHeader: { alg: 'RS256' },
      key: new Uint8Array()
    } as VerifyResult)
    mockValidateSignalAgainstEmbeddedSchemas.mockResolvedValue({
      valid: false,
      message: 'Invalid schema'
    })
    const result = await handler(baseEvent as APIGatewayProxyEvent)
    expect(result.statusCode).toBe(400)
    expect(warnSpy).toHaveBeenCalledWith('Schema validationg failed', { Error })
  })

  it('returns 400 when signal routing fails', async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      payload: mockJwtPayload,
      protectedHeader: { alg: 'RS256' },
      key: new Uint8Array()
    } as VerifyResult)
    mockValidateSignalAgainstEmbeddedSchemas.mockResolvedValue({
      valid: true,
      schema: 'test-schema'
    })
    mockHandleSignalRoutingByEventType.mockResolvedValue({ valid: false })
    const result = await handler(baseEvent as APIGatewayProxyEvent)
    expect(result.statusCode).toBe(400)
    expect(errorSpy).toHaveBeenCalledWith('failed to route signal')
  })

  it('returns 202 when signal processing succeeds', async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      payload: mockJwtPayload,
      protectedHeader: { alg: 'RS256' },
      key: new Uint8Array()
    } as VerifyResult)
    mockValidateSignalAgainstEmbeddedSchemas.mockResolvedValue({
      valid: true,
      schema: 'test-schema'
    })
    mockHandleSignalRoutingByEventType.mockResolvedValue({
      valid: true,
      schema: 'test-schema'
    })
    const result = await handler(baseEvent as APIGatewayProxyEvent)
    expect(result.statusCode).toBe(202)
    expect(result.body).toBe('')
    expect(mockHandleSignalRoutingByEventType).toHaveBeenCalledWith(
      mockJwtPayload
    )
  })

  it('returns 500 when unexpected error occurs', async () => {
    mockGetPublicKeyFromRemote.mockImplementation(() => {
      throw new Error('Unexpected error')
    })
    const result = await handler(baseEvent as APIGatewayProxyEvent)
    expect(result.statusCode).toBe(500)
  })
})
