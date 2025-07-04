import * as jose from 'jose'

export async function validateJWT(
  jwt: string,
  publicKey: Parameters<typeof jose.jwtVerify>[1]
) {
  const result = await jose.jwtVerify(jwt, publicKey)
  return result
}
