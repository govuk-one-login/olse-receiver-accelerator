import { startHealthCheck } from './startHealthCheck'
import { ConfigurationKeys } from '../../../common/config/configurationKeys'
import { baseLogger as logger } from '../../../common/logging/logger'
import { sendVerificationSignal } from '../../../src/vendor/jwtHelper/sendVerification'

vi.mock('../../../src/vendor/jwtHelper/sendVerification', () => ({
  sendVerificationSignal: vi.fn()
}))

const mockSendVerificationSignal = vi.mocked(sendVerificationSignal)
const loggerInfoSpy = vi.spyOn(logger, 'info')

vi.useFakeTimers()

process.env[ConfigurationKeys.VERIFICATION_INTERVAL] = '15'
process.env[ConfigurationKeys.VERIFICATION_ENDPOINT_URL] =
  'https://gds.co.uk/verify'
process.env[ConfigurationKeys.STREAM_ID] = 'stream_id'

describe('startHealthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    mockSendVerificationSignal.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('returns true when scheduling succeeds', () => {
    const result = startHealthCheck()
    expect(result).toBe(true)
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      'Verification signals scheduled sucessfully'
    )
  })
})
