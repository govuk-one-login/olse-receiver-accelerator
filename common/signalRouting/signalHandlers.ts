import { logger } from '../logger'
import { VerificationPayload } from '../interfaces/interfaces'
import { verifyStateJwt } from './verifyState'

interface validResponse {
  valid: true
}

interface invalidResponse {
  valid: false
  errorMessage: string
}

export async function handleVerificationSignal(
  _setPayload: Record<string, unknown>
): Promise<validResponse | invalidResponse> {
  const verificationPayload = _setPayload as unknown as VerificationPayload
  const state =
    verificationPayload.events[
      'https://schemas.openid.net/secevent/ssf/event-type/verification'
    ].state

  if (!state) {
    logger.info('Verification signal without state received')
    return { valid: true }
  }

  if (typeof state === 'string' && state.split('.').length === 3) {
    logger.info('Verification signal with state recieved', {
      stateFormat: 'JWT',
      stateParts: state.split('.').length
    })

    const statePayload = await verifyStateJwt(state)

    if (!statePayload) {
      logger.error('Invalid state JWT: ', { statePayload })
      return { valid: false, errorMessage: 'invalid_state' }
    }
  }
  logger.info('Verification signal with state payload validated successfully')
  return { valid: true }
}
