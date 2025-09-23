import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from './handler'
import { getVerificationRequest } from './requestParser'
import { constructVerificationFullSecurityEvent } from './constructVerificationSecurityEvent'
import { signedJWTWithKMS } from '../kmsService'
import { isValidationError } from './validation'
import { SET, SETVerificationRequest } from '../mockApiTxInterfaces'
import { getTokenFromCognito } from '../../../../../tests/vendor/helpers/getTokenFromCognito'
import { getParameter } from '../../../../../common/ssm/ssm'
import { getEnv } from '../utils'
import { ConfigurationKeys } from '../../../../../common/config/configurationKeys'

jest.mock('./requestParser')
jest.mock('./constructVerificationSecurityEvent')
jest.mock('../kmsService')
jest.mock('./validation')
jest.mock('../../../../../tests/vendor/helpers/getTokenFromCognito')
jest.mock('../../../../../common/ssm/ssm')
jest.mock('../utils')

const mockParseRequest = jest.mocked(getVerificationRequest)
const mockBuildSecurityEvent = jest.mocked(
  constructVerificationFullSecurityEvent
)
const mockSignWithKms = jest.mocked(signedJWTWithKMS)
const mockCheckValidationError = jest.mocked(isValidationError)
const mockGetCognitoToken = jest.mocked(getTokenFromCognito)
const mockGetSsmParameter = jest.mocked(getParameter)
const mockReadEnv = jest.mocked(getEnv)

const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn()
global.fetch = fetchMock

const mockEvent: Partial<APIGatewayProxyEvent> = {
  requestContext: { requestId: 'test-request-id-001' }
} as unknown as APIGatewayProxyEvent

describe('transmitter handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env['RECEIVER_SECRET_ARN'] = 'arn'
    mockReadEnv.mockImplementation((key: string) => {
      if (key === ConfigurationKeys.AWS_STACK_NAME) return 'test-stack'
      throw new Error(`Unexpected key: ${key}`)
    })
    mockGetSsmParameter.mockResolvedValue('https://receiver.com/events')
    mockGetCognitoToken.mockResolvedValue('mock-token')
    mockSignWithKms.mockResolvedValue('mock-jwt')
    fetchMock.mockResolvedValue(new Response('', { status: 202 }))
  })

  afterEach(() => {
    delete process.env['RECEIVER_SECRET_ARN']
  })

  it('sends a verification event successfully', async () => {
    const request: SETVerificationRequest = {
      stream_id: 'user-123',
      state: undefined
    }
    const securityEvent: SET = {
      jti: 'jti-123',
      iss: 'issuer',
      aud: 'audience',
      iat: Math.floor(Date.now() / 1000),
      sub_id: { format: 'opaque', id: 'user-123' },
      events: {
        'https://schemas.openid.net/secevent/ssf/event-type/verification': {
          state: 'abc'
        }
      }
    }
    mockParseRequest.mockReturnValue(request)
    mockBuildSecurityEvent.mockReturnValue(securityEvent)

    const result = await handler(mockEvent as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(204)
    expect(mockGetSsmParameter).toHaveBeenCalledWith(
      '/test-stack/receiver-endpoint'
    )
    expect(mockGetCognitoToken).toHaveBeenCalledWith('arn')
  })

  it('returns 400 for validation errors', async () => {
    const error = new Error('Invalid request')
    mockParseRequest.mockImplementation(() => {
      throw error
    })
    mockCheckValidationError.mockReturnValue(true)

    const result = await handler(mockEvent as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 500 ifor internal errors', async () => {
    const error = new Error('Failure')
    mockParseRequest.mockImplementation(() => {
      throw error
    })
    mockCheckValidationError.mockReturnValue(false)

    const result = await handler(mockEvent as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(500)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
