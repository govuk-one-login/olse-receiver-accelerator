import { SignJWT, importJWK, JWK } from 'jose'
import * as fs from 'fs'

const PRIVATE_KEY_PATH = './keys/authPrivate.key'

const getPrivateKey = async () => {
  const privateKeyJwk = JSON.parse(
    fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')
  ) as JWK
  return await importJWK(privateKeyJwk, 'PS256')
}

export const generateJWT = async (): Promise<string> => {
  const privateKey = await getPrivateKey()

  return await new SignJWT({})
    .setProtectedHeader({ alg: 'PS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey)
}
