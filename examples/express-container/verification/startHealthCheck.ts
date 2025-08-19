import { sendVerificationSignal } from './sendVerification'
import { ConfigurationKeys } from '../config/configurationKeys'
import { config } from '../config/globalConfig'
import { logger } from '../../../common/logger'

let verificationTimer: NodeJS.Timeout | undefined
export function startHealthCheck(): boolean {
  if (verificationTimer) {
    return true
  }
  const INTERVALS_MILLISECONDS =
    config.getNumber(ConfigurationKeys.VERIFICATION_INTERVAL) ?? 900000
  const VERIFICATION_ENDPOINT_URL = config.getOrDefault(
    ConfigurationKeys.VERIFICATION_ENDPOINT_URL,
    'https://rp.co.uk/verify'
  )
  const STREAM_ID = config.getOrDefault(
    ConfigurationKeys.STREAM_ID,
    'default-stream-id'
  )
  try {
    verificationTimer = setInterval(() => {
      void sendVerificationSignal(VERIFICATION_ENDPOINT_URL, STREAM_ID)
    }, INTERVALS_MILLISECONDS)
    logger.info('Verification signals scheduled sucessfully')
    return true
  } catch (error) {
    logger.error('Error scheduling verification signals:', {
      error: error instanceof Error ? error.message : 'unknown error'
    })
    return false
  }
}

export function stopVerificationSignals(): void {
  if (verificationTimer) {
    clearInterval(verificationTimer)
  }
}
