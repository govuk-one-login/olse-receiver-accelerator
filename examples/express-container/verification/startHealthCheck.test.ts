import { startHealthCheck } from './startHealthCheck'
import { sendVerificationSignal } from './sendVerification'
import { ConfigurationKeys } from '../config/ConfigurationKeys'
import { logger } from '../../../common/logger'

jest.mock('./sendVerification', () => ({
  sendVerificationSignal: jest.fn()
}))

const loggerInfoSpy = jest.spyOn(logger, 'info').mockImplementation()
jest.useFakeTimers()

process.env[ConfigurationKeys.VERIFICATION_INTERVAL] = '15'
process.env[ConfigurationKeys.RELYING_PARTY_URL] = 'https://gds.co.uk/verify'
process.env[ConfigurationKeys.STREAM_ID] = 'stream_id'

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
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      'Verification signals scheduled sucessfully'
    )
  })
})
