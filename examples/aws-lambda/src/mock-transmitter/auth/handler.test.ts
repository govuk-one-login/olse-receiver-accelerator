import {
  APIGatewayAuthorizerEvent,
  APIGatewayTokenAuthorizerEvent
} from 'aws-lambda'
import { handler } from './handler'
import { generatePolicy } from './policy'
import { verifyAuthRequest } from './cognitoService'
import { getEnv } from '../utils'

jest.mock('../utils')
jest.mock('./policy')
jest.mock('./cognitoService')

const mockGetEnv = jest.mocked(getEnv)
const mockGeneratePolicy = jest.mocked(generatePolicy)
const mockVerifyAuthRequest = jest.mocked(verifyAuthRequest)

const mockAuthEvent: Partial<APIGatewayAuthorizerEvent> = {
  type: 'TOKEN',
  methodArn: 'test-method-arn',
  authorizationToken: 'Bearer asd'
}

describe('authorisation handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetEnv.mockReturnValue('test-cognito-client-id-001')
  })
  it('returns allow when auth succeeds', async () => {
    const mockAuthResult = {
      isAuthorised: true,
      principalId: 'test-client-001',
      context: {
        accessToken: 'test-access-token-001',
        clientId: 'test-client-id-001',
        grantType: 'test-client-credentials-001'
      }
    }
    mockVerifyAuthRequest.mockResolvedValue(mockAuthResult)
    await handler(mockAuthEvent as unknown as APIGatewayTokenAuthorizerEvent)

    expect(mockGeneratePolicy).toHaveBeenCalledWith(
      'test-client-001',
      'Allow',
      'test-method-arn',
      {
        accessToken: 'test-access-token-001',
        clientId: 'test-client-id-001',
        grantType: 'test-client-credentials-001'
      }
    )
  })

  it('returns Deny policy when auth fails', async () => {
    const mockAuthResult = {
      isAuthorised: false,
      error: 'Invalid credentials'
    }

    mockVerifyAuthRequest.mockResolvedValue(mockAuthResult)

    await handler(mockAuthEvent as unknown as APIGatewayTokenAuthorizerEvent)
    expect(mockGeneratePolicy).toHaveBeenCalledWith(
      'Invalid credentials',
      'Deny',
      'test-method-arn',
      { error: 'Invalid credentials' }
    )
  })
})
