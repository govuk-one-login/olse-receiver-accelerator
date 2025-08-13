import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { verifyAuthRequest } from './cognitoService'
import { AuthRequest } from '../mockApiTxInterfaces'

jest.mock('@aws-sdk/client-cognito-identity-provider')

const mockCognitoClient = jest.mocked(CognitoIdentityProviderClient)
const mockSend = jest.fn()

const mockAuthRequest: AuthRequest = {
  tokenEndpointClientId: 'test-client-id-001',
  body: JSON.stringify({
    grant_type: 'test-grant-type-001',
    client_id: 'test-client-001',
    client_secret: 'test-secret-001',
    scope: 'test-scope-001'
  })
}

describe('verifyAuthRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCognitoClient.mockImplementation(
      () =>
        ({
          send: mockSend
        }) as unknown as CognitoIdentityProviderClient
    )
  })

  it('returns authosied result when credentials are valid', async () => {
    const mockAccessToken = 'test-access-token-001'
    mockSend.mockResolvedValue({
      AuthenticationResult: {
        AccessToken: mockAccessToken
      }
    })

    const result = await verifyAuthRequest(mockAuthRequest)

    expect(result).toEqual({
      isAuthorised: true,
      principalId: 'test-client-001',
      context: {
        accessToken: mockAccessToken,
        clientId: 'test-client-id-001',
        grantType: 'test-grant-type-001',
        scope: 'test-scope-001'
      }
    })
  })

  it('returns error when body is missing', async () => {
    const result = await verifyAuthRequest({
      tokenEndpointClientId: 'test-tokenendpoint-001',
      body: null
    })

    expect(result).toEqual({
      isAuthorised: false,
      error: 'Missing request body'
    })
  })
  it('returns error when grant_type is missing', async () => {
    const result = await verifyAuthRequest({
      tokenEndpointClientId: 'test-tokenendpoint-001',
      body: JSON.stringify({
        grant_type: null,
        client_id: 'test-client-001',
        client_secret: 'test-secret-001',
        scope: 'test-scope-001'
      })
    })

    expect(result).toEqual({
      isAuthorised: false,
      error: 'Missing grant type'
    })
  })
  it('returns error when client_id is missing', async () => {
    const result = await verifyAuthRequest({
      tokenEndpointClientId: 'test-tokenendpoint-001',
      body: JSON.stringify({
        grant_type: 'test-grant-type-001',
        client_id: null,
        client_secret: 'test-secret-001',
        scope: 'test-scope-001'
      })
    })

    expect(result).toEqual({
      isAuthorised: false,
      error: 'Missing client id'
    })
  })

  it('returns error when client_secret is missing', async () => {
    const result = await verifyAuthRequest({
      tokenEndpointClientId: 'test-tokenendpoint-001',
      body: JSON.stringify({
        grant_type: 'test-grant-type-001',
        client_id: 'test-client-id-001',
        client_secret: null,
        scope: 'test-scope-001'
      })
    })

    expect(result).toEqual({
      isAuthorised: false,
      error: 'Missing client secret'
    })
  })

  it('returns error when no access token', async () => {
    mockSend.mockResolvedValue({
      AuthenticationResult: {}
    })

    const result = await verifyAuthRequest(mockAuthRequest)

    expect(result).toEqual({
      isAuthorised: false,
      error: 'Authentication failed - no access token received'
    })
  })

  it('returns error when cognito fails', async () => {
    mockSend.mockRejectedValue(new Error('Error'))

    const result = await verifyAuthRequest(mockAuthRequest)

    expect(result).toEqual({
      isAuthorised: false,
      error: 'Auth service error'
    })
  })
})
