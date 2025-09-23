import { ConfigurationKeys } from '../../../common/config/configurationKeys'
import { config } from '../../../common/config/config'
import { baseLogger as logger } from '../../../common/logging/logger'
import { sendVerificationSignal } from '../../../src/vendor/jwtHelper/sendVerification'

let verificationTimer: NodeJS.Timeout | undefined

export function startHealthCheck(): boolean {
  if (verificationTimer) {
    return true
  }
  const INTERVALS_MILLISECONDS = config.getNumber(
    ConfigurationKeys.VERIFICATION_INTERVAL
  )
  const VERIFICATION_ENDPOINT_URL = config.get(
    ConfigurationKeys.VERIFICATION_ENDPOINT_URL
  )
  const STREAM_ID = config.get(ConfigurationKeys.STREAM_ID)

  try {
    verificationTimer = setInterval(() => {
      void sendVerificationSignal(VERIFICATION_ENDPOINT_URL, STREAM_ID)
    }, INTERVALS_MILLISECONDS)
    logger.info('Verification signals scheduled sucessfully')
    return true
  } catch (error) {
    logger.error('Error scheduling verification signals:', {
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

export function stopVerificationSignals(): void {
  if (verificationTimer) {
    clearInterval(verificationTimer)
  }
}
