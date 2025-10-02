import { SignJWT, importJWK, JWK, CryptoKey } from 'jose'
import * as fs from 'fs'
import { generateJWTPayload } from '../types'
import { ConfigurationKeys } from '../../../common/config/configurationKeys'
import { config } from '../../../common/config/config'

export const getPrivateKey = async (): Promise<CryptoKey | Uint8Array> => {
  try {
    const privateKeyFilePath = config.get(ConfigurationKeys.PRIVATE_KEY_PATH)
    const privateKeyContent = fs.readFileSync(privateKeyFilePath, 'utf8')
    const privateKeyJwk = JSON.parse(privateKeyContent) as JWK
    return await importJWK(privateKeyJwk, 'RS256')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to load private key: ${message}`)
  }
}

export const generateJWT = async (
  payload: generateJWTPayload
): Promise<string> => {
  const key = await getPrivateKey()
  const basePayload = new SignJWT(payload.payload)
    .setProtectedHeader({ alg: payload.alg })
    .setIssuedAt()
    .setIssuer(payload.issuer)
    .setJti(payload.jti)
    .setAudience(payload.audience)
  if (payload.useExpClaim) {
    basePayload.setExpirationTime('1h')
  }
  return await basePayload.sign(key)
}
