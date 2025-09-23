import { getPublicKeyFromJWK } from '../../src/vendor/publicKey/getPublicKey'
import { validateJWT } from '../../src/vendor/jwt/validateJWT'
import { readFileSync } from 'fs'
import { config } from '../config/config'
import { ConfigurationKeys } from '../config/configurationKeys'
import { baseLogger as logger } from '../logging/logger'

export async function verifyStateJwt(
  stateJwt: string
): Promise<Record<string, unknown> | null> {
  try {
    const publicKeyPath = config.get(ConfigurationKeys.PUBLIC_KEY_PATH)

    const publicKeyString = readFileSync(publicKeyPath, { encoding: 'utf8' })
    const publicKeyJson = JSON.parse(publicKeyString) as Record<string, unknown>

    const publicKey = await getPublicKeyFromJWK(
      publicKeyJson
    )
    const result = await validateJWT(stateJwt, publicKey)

    return result.payload as Record<string, unknown>
  } catch (error) {
    logger.error('Failed to verify state JWT:', {
      error: error instanceof Error ? error.message : String(error)
    })
    return null
  }
}
