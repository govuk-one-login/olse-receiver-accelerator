import { startHealthCheck } from './startHealthCheck'
import { sendVerificationSignal } from './sendVerification'
import { config } from '../config/EnvironmentalVariableConfigurationProvider'
import { ConfigurationKeys } from '../config/ConfigurationKeys'

jest.mock('./sendVerification', () => ({
  sendVerificationSignal: jest.fn()
}))

const consoleLogSpy = jest.spyOn(console, 'log')
jest.useFakeTimers()

config.set(ConfigurationKeys.VERIFICATION_INTERVAL, '15')
config.set(ConfigurationKeys.RELYING_PARTY_URL, 'https://gds.co.uk/verify')
config.set(ConfigurationKeys.STREAM_ID, 'streamId')

describe('startHealthCheck', () => {
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
    const result = startHealthCheck()

    expect(result).toBe(true)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Verification signals scheduled sucessfully'
    )
  })
})
