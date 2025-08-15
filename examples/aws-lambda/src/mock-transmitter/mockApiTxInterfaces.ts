export interface AuthRequest {
  tokenEndpointClientId: string
  body: string | null
}

export type AuthContext = Record<string, string | number | boolean | undefined>

export interface AuthResult {
  isAuthorised: boolean
  principalId?: string
  context?: AuthContext
  error?: string
}

export interface ClientCredentials {
  grant_type: string
  client_id: string
  client_secret: string
  scope?: string
}

export interface RequestBody {
  stream_id: string
  state?: string
}

export interface KmsPublicKeyData {
  keyId: string
  publicKey: Uint8Array
}

export interface PolicyStatement {
  Effect: 'Allow' | 'Deny'
  Action: string
  Resource: string
}

export interface AuthPolicy {
  Version: string
  Statement: PolicyStatement[]
}

export interface AuthResponse {
  principalId: string
  policyDocument: AuthPolicy
  context?: AuthContext
}

export interface SETVerificationRequest {
  stream_id: string
  state: string | undefined
}

export interface SET {
  iss: string
  aud: string
  iat: number
  jti: string
  events: Record<
    string,
    {
      state?: string
    }
  >
  sub_id: {
    format: 'opaque'
    id: string
  }
}
