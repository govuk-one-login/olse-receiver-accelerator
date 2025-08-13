import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider'

export interface AuthRequest {
  tokenEndpointClientId: string
  body: string | null
}

// interface AuthContext {
//     accessToken: string | undefined
//     clientId: string | undefined
//     grantType: string | undefined
//     scope: string | undefined
// }

type AuthContext = Record<string, string | number | boolean | undefined>

interface AuthResult {
  isAuthorised: boolean
  principalId?: string
  context?: AuthContext
  error?: string
}

interface ClientCredentials {
  grant_type: string
  client_id: string
  client_secret: string
  scope?: string
}

export async function verifyAuthRequest(
  authRequest: AuthRequest
): Promise<AuthResult> {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env['AWS_REGION'] ?? 'eu-west-1'
  })

  try {
    if (!authRequest.body) {
      return {
        isAuthorised: false,
        error: 'Missing request body'
      }
    }

    const credentials: ClientCredentials = JSON.parse(
      authRequest.body
    ) as ClientCredentials

    if (!credentials.grant_type) {
      return {
        isAuthorised: false,
        error: 'Missing grant type'
      }
    }

    if (!credentials.client_id) {
      return {
        isAuthorised: false,
        error: 'Missing client id'
      }
    }

    if (!credentials.client_secret) {
      return {
        isAuthorised: false,
        error: 'Missing client secret'
      }
    }

    const authCommand = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: authRequest.tokenEndpointClientId,
      AuthParameters: {
        USERNAME: credentials.client_id,
        PASSWORD: credentials.client_secret
      }
    })

    const authResponse = await cognitoClient.send(authCommand)

    if (authResponse.AuthenticationResult?.AccessToken) {
      return {
        isAuthorised: true,
        principalId: credentials.client_id,
        context: {
          accessToken: authResponse.AuthenticationResult.AccessToken,
          clientId: authRequest.tokenEndpointClientId,
          grantType: credentials.grant_type,
          scope: credentials.scope
        }
      }
    } else {
      return {
        isAuthorised: false,
        error: 'Authentication failed - no access token received'
      }
    }
  } catch (error) {
    console.error('Cognito auth error:', error)
    return {
      isAuthorised: false,
      error: 'Auth service error'
    }
  }
}
