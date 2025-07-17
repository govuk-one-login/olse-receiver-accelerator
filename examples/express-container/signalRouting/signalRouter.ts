import { SignalSchema } from '../constants'
import { handleVerificationSignal } from './signalHandlers'

interface validResponse {
  valid: true
  schema: string
}

interface invalidResponse {
  valid: false
}
export function handleSignalRouting(
  signalPayload: Record<string, unknown>,
  schema: string
): validResponse | invalidResponse {
  switch (schema) {
    case SignalSchema.VERIFICATION_SIGNAL: {
      const handleResponse = handleVerificationSignal(signalPayload)
      if (handleResponse.valid) {
        return {
          valid: true,
          schema: schema
        }
      }
      break
    }

    default:
      return {
        valid: false
      }
  }
  return {
    valid: false
  }
}
