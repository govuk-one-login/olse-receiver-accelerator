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
