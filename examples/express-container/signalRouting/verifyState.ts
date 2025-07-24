import { getPublicKeyFromJWK } from '../../../src/vendor/getPublicKey'
import { validateJWT } from '../../../src/vendor/jwt/validateJWT'
import * as fs from 'fs'
import { config } from '../config/EnvironmentalVariableConfigurationProvider'
import { ConfigurationKeys } from '../config/ConfigurationKeys'

export async function verifyStateJwt(
  stateJwt: string
): Promise<Record<string, unknown> | null> {
  try {
    const PUBLIC_KEY_PATH = config.getOrDefault(
      ConfigurationKeys.PUBLIC_KEY_PATH,
      './keys/authPublic.key'
    )
    const publicKeyString = fs.readFileSync(PUBLIC_KEY_PATH, {
      encoding: 'utf8'
    })

    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const publicKeyJson = JSON.parse(publicKeyString)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const publicKey = await getPublicKeyFromJWK(publicKeyJson)

    const result = await validateJWT(stateJwt, publicKey)

    return result.payload
  } catch (error) {
    console.error('Failed to verify state JWT:', error)
    return null
  }
}
