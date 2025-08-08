interface PolicyStatement {
  Effect: 'Allow' | 'Deny'
  Action: string
  Resource: string
}

interface AuthPolicy {
  Version: string
  Statement: PolicyStatement[]
}

interface AuthResponse {
  principalId: string
  policyDocument: AuthPolicy
  context?: AuthContext
}

type AuthContext = Record<string, string | number | boolean>

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
