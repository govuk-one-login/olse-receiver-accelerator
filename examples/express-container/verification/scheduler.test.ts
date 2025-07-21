import { startVerificationSignals } from './scheduler'
import { sendVerificationSignal } from './send-verification'

jest.mock('./send-verification', () => ({
  sendVerificationSignal: jest.fn()
}))
jest.mock('../config/config', () => ({
  config: {
    VERIFICATION_INTERVAL_MINUTES: '15',
    RELYING_PARTY_URL: 'https.//gds.co.uk/rp',
    STREAM_ID: 'streamId'
  }
}))

const consoleLogSpy = jest.spyOn(console, 'log')
jest.useFakeTimers()

describe('startVerificationSignals', () => {
  const mockSendVerificationSignal =
    sendVerificationSignal as jest.MockedFunction<typeof sendVerificationSignal>
  mockSendVerificationSignal.mockResolvedValue(true)
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })
  afterEach(() => {
    jest.clearAllTimers()
  })

  it('returns true when scheduling succeeds', () => {
    const result = startVerificationSignals()

    expect(result).toBe(true)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Verification signals scheduled sucessfully'
    )
  })
})
