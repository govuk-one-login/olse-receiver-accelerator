import { SignJWT, importJWK, JWK, CryptoKey } from 'jose'
import * as fs from 'fs'
import { generateJWTPayload } from '../types'
import { getSecret } from '../../../common/secretsManager/secretsManager'
import { ConfigurationKeys } from '../../../common/config/configurationKeys'
import { config } from '../../../common/config/globalConfig'

const getPrivateKey = async () => {
  const privateKey = config.getOrDefault(
    ConfigurationKeys.PRIVATE_KEY_PATH,
    './keys/authPrivate.key'
  )
  const privateKeyJwk = JSON.parse(fs.readFileSync(privateKey, 'utf8')) as JWK
  // const privateKeyJwk = JSON.parse(
  //   fs.readFileSync('./keys/authPrivate.key', 'utf8')
  // ) as JWK
  return await importJWK(privateKeyJwk, 'PS256')
}

export const getPrivateKeyFromSecretsManager = async (
  keySecretName: string
): Promise<CryptoKey> => {
  const keySecretString = await getSecret(keySecretName)
  if (!keySecretString) {
    throw new Error('Unable to get private key from Secrets Manager')
  }
  const secretData = JSON.parse(keySecretString) as { privateKey: string }
  if (!secretData.privateKey) {
    throw new Error('Private key not found in secret')
  }

  const privateKeyJwk = JSON.parse(secretData.privateKey) as JWK
  return (await importJWK(privateKeyJwk, 'PS256')) as CryptoKey
}

// generates for 1 hour
export const generateJWT = async (
  payload: generateJWTPayload
): Promise<string> => {
  const PRIVATE_KEY_SECRET = process.env['PRIVATE_KEY_SECRET'] ?? 'default'
  const privateKey = await getPrivateKeyFromSecretsManager(PRIVATE_KEY_SECRET)

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
