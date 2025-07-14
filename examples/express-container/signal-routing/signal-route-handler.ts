import { SetPayload, SignalResult } from '../interfaces/interfaces'
import { RiscEventType, SetErrorCode } from '../enums/enums'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'

export function handleSignalRouting(signalPayload: SetPayload): SignalResult {
  try {
    if (!signalPayload.events) {
      return {
        success: false,
        errorCode: SetErrorCode.MISSING_EVENTS,
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
            errorCode: SetErrorCode.UNSUPPORTED_EVENT_TYPE,
            description: 'Unsupported event type'
          }
      }
    }
    return { success: true }
  } catch (error) {
    console.error('Error processing signal routing:', error)
    return {
      success: false,
      errorCode: SetErrorCode.FAILED_TO_PROCESS,
      description: 'Failed to process the request'
    }
  }
}
// export function handleSignalRouting(req: SetRequest, res: Response): Response {
//   const signalPayload: SetPayload = req.body
//   try {
//     if (!signalPayload.events) {
//       return sendSignalResponse(
//         res,
//         false,
//         SetErrorCode.MISSING_EVENTS,
//         'Missing events in request body'
//       )
//     }
//     for (const [eventType] of Object.entries(signalPayload.events)) {
//       switch (eventType as RiscEventType) {
//         case RiscEventType.ACCOUNT_PURGED:
//           handleAccountPurged(signalPayload, req, res)
//           break
//         case RiscEventType.ACCOUNT_DISABLED:
//           handleAccountDisabled(signalPayload, req, res)
//           break
//         // Add or remove cases to be routed
//         default:
//           return sendSignalResponse(
//             res,
//             false,
//             SetErrorCode.UNSUPPORTED_EVENT_TYPE,
//             'Unsupported event type'
//           )
//       }
//     }
//     return sendSignalResponse(res, true)
//   } catch (error) {
//     console.error('Error processing signal routing:', error)
//     return sendSignalResponse(
//       res,
//       false,
//       SetErrorCode.FAILED_TO_PROCESS,
//       'Failed to process the request'
//     )
//   }
// }
