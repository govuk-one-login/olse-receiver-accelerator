import { SignalSchema } from '../constants'
import { handleVerificationSignal } from './signalHandlers'

interface validResponse {
  valid: true
  schema: string
}
interface invalidResponse {
  valid: false
}

export async function handleSignalRouting(
  signalPayload: Record<string, unknown>,
  schema: string
): Promise<validResponse | invalidResponse> {
  switch (schema) {
    case SignalSchema.VERIFICATION_SIGNAL: {
      const handleResponse = await handleVerificationSignal(signalPayload)
      if (!handleResponse.valid) return { valid: false }
      return { valid: true, schema }
    }
    default:
      return { valid: false }
  }
}
