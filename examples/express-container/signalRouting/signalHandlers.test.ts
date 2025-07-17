import { handleVerificationSignal } from './signalHandlers'

describe('Signal Handlers', () => {
  it('handleVerificationSignal should return success result', () => {
    const signalPayload = { sub: 'user0' }

    const result = handleVerificationSignal(signalPayload)

    expect(result).toEqual({
      valid: true
    })
  })
})
