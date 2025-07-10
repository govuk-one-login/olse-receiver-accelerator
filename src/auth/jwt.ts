import { SignJWT, importJWK, JWK } from 'jose'
import * as fs from 'fs'
import * as path from 'path'

const PRIVATE_KEY_PATH = path.join(__dirname, '../../keys/authPrivate.key')

const getPrivateKey = async () => {
  const privateKeyJwk = JSON.parse(fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')) as JWK
  return await importJWK(privateKeyJwk, 'PS256')
}

export const generateJWT = async (): Promise<string> => {
  const privateKey = await getPrivateKey()

  return await new SignJWT({ 'urn:example:claim': true })
    .setProtectedHeader({ alg: 'PS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey)
}
