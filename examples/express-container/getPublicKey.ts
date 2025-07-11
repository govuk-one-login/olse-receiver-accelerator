// import { readFile } from "fs/promises"
import * as jose from 'jose'

export const getPublicKey = (url: string) => {
  // const publicKey = await JSON.parse((await readFile('./keys/authPublic.key', {encoding: 'utf8'})))
  // return jose.importJWK(publicKey, 'PS256')

  return jose.createRemoteJWKSet(new URL(url))
}
