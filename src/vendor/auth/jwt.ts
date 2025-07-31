import { SignJWT, importJWK, JWK } from 'jose'
import * as fs from 'fs'
import { generateJWTPayload } from '../types'
import { ConfigurationKeys } from '../../../examples/express-container/config/ConfigurationKeys'


const getPrivateKey = async () => {
  const privateKeyJwk = JSON.parse(
    fs.readFileSync(ConfigurationKeys.PRIVATE_KEY_PATH, 'utf8')
  ) as JWK
  return await importJWK(privateKeyJwk, 'PS256')
}

// generates for 1 hour
export const generateJWT = async (
  payload: generateJWTPayload
): Promise<string> => {
  const privateKey = await getPrivateKey()

  const basePayload = new SignJWT(payload.payload)
    .setProtectedHeader({ alg: payload.alg })
    .setIssuedAt()
    .setIssuer(payload.issuer)
    .setJti(payload.jti)
    .setAudience(payload.audience)

  if (payload.useExpClaim) {
    basePayload.setExpirationTime('1h')
  }

  return await basePayload.sign(privateKey)
}

export const generateBasicJWT = async (): Promise<string> => {
  const privateKey = await getPrivateKey()

  return await new SignJWT()
    .setProtectedHeader({ alg: 'PS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey)
}
