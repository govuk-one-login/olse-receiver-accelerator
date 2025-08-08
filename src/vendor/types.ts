import { SET } from "../../examples/mock-transmitter/types"

export interface generateJWTPayload {
  issuer: string
  audience: string
  jti: string
  payload: Record<string, unknown> | SET
  alg: string
  useExpClaim: boolean
}
