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
