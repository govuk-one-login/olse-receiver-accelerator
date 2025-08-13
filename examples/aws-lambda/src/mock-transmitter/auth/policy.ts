import { AuthContext, AuthResponse } from '../mockApiTxInterfaces'

export function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context?: AuthContext
): AuthResponse {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: effect,
          Action: 'execute-api:Invoke',
          Resource: resource
        }
      ]
    },
    context: context ?? {}
  }
}
