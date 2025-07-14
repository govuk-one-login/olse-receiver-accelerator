import { SetPayload, SignalResult } from '../interfaces/interfaces'
import { CustomSetErrorCode, RiscEventType } from '../enums/enums'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'

export function handleSignalRouting(signalPayload: SetPayload): SignalResult {
  try {
    if (!signalPayload.events) {
      return {
        success: false,
        errorCode: CustomSetErrorCode.MISSING_EVENTS,
        description: 'Missing events in request body'
      }
    }
    for (const [eventType] of Object.entries(signalPayload.events)) {
      switch (eventType as RiscEventType) {
        case RiscEventType.ACCOUNT_PURGED:
          return handleAccountPurged(signalPayload)
        case RiscEventType.ACCOUNT_DISABLED:
          return handleAccountDisabled(signalPayload)
        // Add or remove cases to be routed
        default:
          return {
            success: false,
            errorCode: CustomSetErrorCode.UNSUPPORTED_EVENT_TYPE,
            description: 'Unsupported event type'
          }
      }
    }
    return { success: true }
  } catch (error) {
    console.error('Error processing signal routing:', error)
    return {
      success: false,
      errorCode: CustomSetErrorCode.FAILED_TO_PROCESS,
      description: 'Failed to process the request'
    }
  }
}
