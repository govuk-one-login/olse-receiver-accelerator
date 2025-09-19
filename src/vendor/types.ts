export interface generateJWTPayload {
  issuer: string
  audience: string
  jti: string
  payload: Record<string, unknown>
  alg: string
  useExpClaim: boolean
}

export interface VerificationRequestPayload {
  stream_id: string
  state: string
}
