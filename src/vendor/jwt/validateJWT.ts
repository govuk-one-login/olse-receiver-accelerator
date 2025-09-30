import * as jose from 'jose'
import { getPublicKeyFromRemote } from '../publicKey/getPublicKey'

export async function validateJWT(
  jwt: string,
  publicKey: jose.CryptoKey | jose.KeyObject | jose.JWK | Uint8Array,
  options?: jose.JWTVerifyOptions
) {
  const result = await jose.jwtVerify(jwt, publicKey, options)
  return result
}

export async function validateJWTWithRemoteKey(
  jwt: string,
  publicKey: ReturnType<typeof getPublicKeyFromRemote>,
  options?: jose.JWTVerifyOptions
) {
  const result = await jose.jwtVerify(jwt, publicKey, options)
  return result
}
