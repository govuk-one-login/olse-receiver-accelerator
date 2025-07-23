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
    console.log('Verification signal without state received')
    return { valid: true }
  }

  if (typeof state === 'string' && state.split('.').length === 3) {
    console.log('Verification signal with state recieved')

    const statePayload = await verifyStateJwt(state)

    if (!statePayload) {
      console.error('Invalid state JWT')
      return { valid: false, errorMessage: 'invalid_state' }
    }
    const maxAge = 15 * 60
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - statePayload.requested_at > maxAge) {
      return { valid: false, errorMessage: 'invalid_state' }
    }
  }
  console.log('Verification signal with state payload validated successfully')
  return { valid: true }
}
