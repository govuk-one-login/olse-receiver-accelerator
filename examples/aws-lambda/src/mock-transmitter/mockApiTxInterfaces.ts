export interface RequestBody {
  stream_id: string
  state?: string
}

export interface KmsPublicKeyData {
  keyId: string
  publicKey: Uint8Array
}

export interface SETVerificationRequest {
  stream_id: string
  state: string | undefined
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
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
