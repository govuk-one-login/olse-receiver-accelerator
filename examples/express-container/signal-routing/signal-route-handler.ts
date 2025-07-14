import { SetPayload, SignalResult } from '../interfaces/interfaces'
import { CustomSetErrorCode, RiscEventType } from '../enums/enums'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'

export function handleSignalRouting(signalPayload: SetPayload): SignalResult {
  try {
    if (
      !signalPayload.events ||
      Object.keys(signalPayload.events).length === 0
    ) {
      return {
        success: false,
        errorCode: CustomSetErrorCode.MISSING_EVENTS,
        description: 'Missing events in Set Payload',
        statusCode: 400
      }
    }
    const event = Object.keys(signalPayload.events)
    const eventTypeName = event[0]

    switch (eventTypeName as RiscEventType) {
      case RiscEventType.ACCOUNT_PURGED:
        return handleAccountPurged(signalPayload)
      case RiscEventType.ACCOUNT_DISABLED:
        return handleAccountDisabled(signalPayload)
      // Add or remove cases to be routed
      default:
        return {
          success: false,
          errorCode: CustomSetErrorCode.UNSUPPORTED_EVENT_TYPE,
          description: 'Unsupported event type',
          statusCode: 400
        }
    }
  } catch (error) {
    console.error('Error processing signal routing:', error)
    return {
      success: false,
      errorCode: CustomSetErrorCode.FAILED_TO_PROCESS,
      description: 'Failed to process the request',
      statusCode: 500
    }
  }
}
