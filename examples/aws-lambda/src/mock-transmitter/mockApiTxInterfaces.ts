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
