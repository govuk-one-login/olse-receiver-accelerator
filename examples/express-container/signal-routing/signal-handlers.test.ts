import { SetPayload } from '../interfaces/interfaces'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'

describe('Signal Handlers', () => {
  it('handleAccountPurged should return success result', () => {
    const signalPayload: SetPayload = { sub: 'user0' }

    const result = handleAccountPurged(signalPayload)

    expect(result).toEqual({
      success: true,
      message: 'Account purged.'
    })
  })
  it('handleAccountDisabled should return success result', () => {
    const signalPayload: SetPayload = { sub: 'user1' }

    const result = handleAccountDisabled(signalPayload)

    expect(result).toEqual({
      success: true,
      message: 'Account disabled.'
    })
  })
})
