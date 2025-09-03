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
      if (!handleResponse.valid) {
        return {
          valid: false
        }
      }
      return {
        valid: true,
        schema: schema
      }
    }
    default:
      return {
        valid: false
      }
  }
}

export async function handleSignalRoutingByEventType(
  signalPayload: Record<string, unknown>
): Promise<validResponse | invalidResponse> {
  const events = signalPayload['events'] as Record<string, unknown> | undefined
  console.log('events:', events)

  if (!events) {
    return {
      valid: false
    }
  }
  const eventType = Object.keys(events)[0]
  console.log('eventType:', eventType)
  switch (eventType) {
    case 'https://schemas.openid.net/secevent/ssf/event-type/verification': {
      const handleResponse = await handleVerificationSignal(signalPayload)
      if (!handleResponse.valid) {
        return {
          valid: false
        }
      }
      return {
        valid: true,
        schema: SignalSchema.VERIFICATION_SIGNAL
      }
    }
    default:
      return {
        valid: false
      }
  }
}
