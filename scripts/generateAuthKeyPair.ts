import * as jose from 'jose'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const main = async () => {
  const { publicKey, privateKey } = await jose.generateKeyPair('PS256', {
    extractable: true
  })
  const privateJwk = await jose.exportJWK(privateKey)
  const publicJwk = await jose.exportJWK(publicKey)
  if (!existsSync('./keys/')) {
    mkdirSync('./keys/')
  }
  writeFileSync('./keys/authPrivate.key', JSON.stringify(privateJwk))
  writeFileSync('./keys/authPublic.key', JSON.stringify(publicJwk))
}

main()
  .then(() => {
    console.log('Successfully generated private and public key, saved to disk')
  })
  .catch((err: unknown) => {
    console.error(err)
  })
