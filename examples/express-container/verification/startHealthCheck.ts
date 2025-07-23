import { sendVerificationSignal } from './sendVerification'
import { config } from '../config/config'

let verificationTimer: NodeJS.Timeout | undefined
export function startHealthCheck(): boolean {
  if (verificationTimer) {
    return true
  }
  const intervalMs = config.VERIFICATION_INTERVAL * 60 * 1000
  try {
    verificationTimer = setInterval(() => {
      void sendVerificationSignal(config.RELYING_PARTY_URL, config.STREAM_ID)
    }, intervalMs)
    console.log('Verification signals scheduled sucessfully')
    return true
  } catch (error) {
    console.error('Error scheduling verification signals:', error)
    return false
  }
}

export function stopVerificationSignals(): void {
  if (verificationTimer) {
    clearInterval(verificationTimer)
  }
}
