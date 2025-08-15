import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent
} from 'aws-lambda'
import { getEnv } from '../utils'
import { generatePolicy } from './policy'
import { verifyAuthRequest } from './cognitoService'

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const tokenEndpointClientId = getEnv('COGNITO_CLIENT_ID')
  if (!tokenEndpointClientId) {
    return generatePolicy('error', 'Deny', event.methodArn)
  }

  let body: string | null = null

  if (event.authorizationToken) {
    if (event.authorizationToken.startsWith('Bearer ')) {
      const token = event.authorizationToken.substring(7)
      body = Buffer.from(token, 'base64').toString('utf-8')
    }
  }

  const authResult = await verifyAuthRequest({
    tokenEndpointClientId,
    body
  })

  if (authResult.isAuthorised && authResult.principalId) {
    return generatePolicy(
      authResult.principalId,
      'Allow',
      event.methodArn,
      authResult.context
    )
  }

  return generatePolicy(
    authResult.error ?? 'unauthorised',
    'Deny',
    event.methodArn,
    {
      error: String(authResult.error)
    }
  )
}
