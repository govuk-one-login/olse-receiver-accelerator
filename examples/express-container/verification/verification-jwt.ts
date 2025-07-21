import { StatePayload } from '../interfaces/interfaces'
import { config } from '../config/config'
import { generateJWT } from '../../../src/vendor/auth/jwt'
import { generateJWTPayload } from '../../../src/vendor/types'

export async function createStateJwt(
  stream_id: string,
  relyingPartyUrl: string
): Promise<string> {
  try {
    const statePayload: StatePayload = {
      requested_at: Math.floor(Date.now() / 1000),
      stream_id: stream_id
    }
    const jwtPayload: generateJWTPayload = {
      payload: statePayload,
      alg: 'PS256',
      issuer: process.env['JWT_ISSUER'] ?? 'issuer',
      jti: `state-${String(Date.now())})`,
      audience: relyingPartyUrl,
      useExpClaim: true
    }

    return await generateJWT(jwtPayload)
  } catch (error) {
    console.error('Error creating state JWT:', error)
    throw new Error('Failed to create state JWT')
  }
}

export async function createVerificationJwt(
  relyingPartyUrl: string,
  streamId: string,
  options?: {
    state?: string
    generateStatePayload?: boolean
  }
): Promise<string> {
  try {
    let stateValue: string | StatePayload | undefined

    if (options?.generateStatePayload) {
      stateValue = await createStateJwt(streamId, relyingPartyUrl)
    } else if (options?.state) {
      stateValue = options.state
    }
    const verificationEvent = {
      'https://schemas.openid.net/secevent/ssf/event-type/verification': {} as {
        state?: string | StatePayload
      }
    }

    if (stateValue) {
      verificationEvent[
        'https://schemas.openid.net/secevent/ssf/event-type/verification'
      ].state = stateValue
    }

    const jwtPayload: generateJWTPayload = {
      payload: {
        sub_id: {
          format: 'opaque',
          id: streamId
        },
        events: verificationEvent
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
