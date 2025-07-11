// import { readFile } from "fs/promises"
// import * as jose from 'jose'

export const getPublicKey = async (url) => {
  // const publicKey = await JSON.parse((await readFile('./keys/authPublic.key', {encoding: 'utf8'})))
  // console.log(publicKey)
  // return jose.importJWK(publicKey, 'PS256')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return fetch(url)
}
