import { config } from '../config/config'
import { generateJWT } from '../../../src/vendor/auth/jwt'
import { generateJWTPayload } from '../../../src/vendor/types'

export async function createVerificationJwt(
  relyingPartyUrl: string,
  streamId: string
): Promise<string> {
  try {
    const jwtPayload: generateJWTPayload = {
      payload: {
        streamId: streamId
      },
      alg: 'PS256',
      issuer: config.ISSUER,
      jti: `verification-${String(Date.now())}`,
      audience: relyingPartyUrl,
      useExpClaim: true
    }

    return await generateJWT(jwtPayload)
  } catch (error) {
    console.error('Error creating verification JWT:', error)
    throw new Error('Failed to create verification JWT')
  }
}
