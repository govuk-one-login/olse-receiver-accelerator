import { SignalSchema } from '../enums/enums'
import { handleVerificationSignal } from './signalHandlers'

interface validResponse {
  valid: true
  schema: string
}

interface invalidResponse {
  valid: false
  errorMessage: string
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
        valid: false,
        errorMessage: 'unsupportedEventType'
      }
  }
  return {
    valid: false,
    errorMessage: 'unsupportedEventType'
    // errorCode: CustomSetErrorCode.UNSUPPORTED_EVENT_TYPE,
    // description: 'Unsupported event type',
    // statusCode: 400
  }
}
