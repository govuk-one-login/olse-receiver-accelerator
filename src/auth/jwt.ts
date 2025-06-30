import { SignJWT } from 'jose'
import * as fs from 'fs'
import * as path from 'path'
import { importPKCS8 } from 'jose'

const PRIVATE_KEY_PATH = path.join(__dirname, '../../keys/private.key')
const privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')

// Import the private key (RS256 requires PKCS#8 format)
const getPrivateKey = async () => {
  return await importPKCS8(privateKeyPem, 'RS256')
}

export const generateJWT = async (): Promise<string> => {
  const privateKey = await getPrivateKey()

  return await new SignJWT({ 'urn:example:claim': true })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey)
}
