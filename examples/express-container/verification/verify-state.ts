import { getPublicKeyFromJWK } from '../../../src/vendor/getPublicKey'
import { validateJWT } from '../../../src/vendor/jwt/validateJWT'
import { StatePayload } from '../interfaces/interfaces'
import * as fs from 'fs'

export async function verifyStateJwt(
  stateJwt: string
): Promise<StatePayload | null> {
  try {
    const publicKeyString = fs.readFileSync('./keys/authPublic.key', {
      encoding: 'utf8'
    })

    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const publicKeyJson = JSON.parse(publicKeyString)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const publicKey = await getPublicKeyFromJWK(publicKeyJson)

    const result = await validateJWT(stateJwt, publicKey)

    return result.payload as unknown as StatePayload
  } catch (error) {
    console.error('Failed to verify state JWT:', error)
    return null
  }
}
