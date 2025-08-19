import { config } from '../config/awsConfig'
import { generateJWT } from '../../../src/vendor/auth/jwt'
import { generateJWTPayload } from '../../../src/vendor/types'
import { ConfigurationKeys } from '../config/ConfigurationKeys'
import { logger } from '../../../common/logger'

export async function createVerificationJwt(
  relyingPartyUrl: string,
  streamId: string
): Promise<string> {
  try {
    const ISSUER = config.getOrDefault(
      ConfigurationKeys.ISSUER,
      'default-issuer'
    )

    const jwtPayload: generateJWTPayload = {
      payload: {
        streamId: streamId
      },
      alg: 'PS256',
      issuer: ISSUER,
      jti: `verification-${String(Date.now())}`,
      audience: relyingPartyUrl,
      useExpClaim: true
    }

    return await generateJWT(jwtPayload)
  } catch (error) {
    logger.error('Error creating verification JWT:', {
      error: error instanceof Error ? error.message : String(error)
    })
    throw new Error('Failed to create verification JWT')
  }
}
