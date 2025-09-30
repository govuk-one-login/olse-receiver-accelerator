import * as jose from 'jose'

export const getPublicKeyFromRemote = (url: string) => {
  return jose.createRemoteJWKSet(new URL(url))
}

export const getPublicKeyFromJWK = async (jwk: Record<string, unknown>) => {
  return await jose.importJWK(jwk)
}
