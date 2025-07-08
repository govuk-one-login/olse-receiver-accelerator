import * as jose from 'jose'

export async function validateJWT(
  jwt: string,
  publicKey: jose.CryptoKey | jose.KeyObject | jose.JWK | Uint8Array,
  options?: jose.JWTVerifyOptions
) {
  const result = await jose.jwtVerify(jwt, publicKey, options)
  return result
}
