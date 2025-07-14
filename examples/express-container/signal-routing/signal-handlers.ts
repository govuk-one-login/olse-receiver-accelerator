import { SetPayload, SignalResult } from '../interfaces/interfaces'

export function handleAccountPurged(_setPayload: SetPayload): SignalResult {
  return {
    success: true,
    message: 'Account purged.'
  }
}
export function handleAccountDisabled(_setPayload: SetPayload): SignalResult {
  return {
    success: true,
    message: 'Account disabled.'
  }
}
// export function handleAccountPurged(
//   _setPayload: SetPayload,
//   _req: SetRequest,
//   res: Response
// ): void {
//   res.status(200).json({ success: true, message: 'Account purged.' })
// }

// export function handleAccountDisabled(
//   _setPayload: SetPayload,
//   _req: SetRequest,
//   res: Response
// ): void {
//   res.status(200).json({ success: true, message: 'Account disabled.' })
// }
