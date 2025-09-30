import { startHealthCheck } from './startHealthCheck'
import { ConfigurationKeys } from '../../../common/config/configurationKeys'
import { baseLogger as logger } from '../../../common/logging/logger'
import { sendVerificationSignal } from '../../../src/vendor/jwtHelper/sendVerification'

jest.mock('../../../src/vendor/jwtHelper/sendVerification', () => ({
  sendVerificationSignal: jest.fn()
}))

const mockSendVerificationSignal = jest.mocked(sendVerificationSignal)
const loggerInfoSpy = jest.spyOn(logger, 'info').mockImplementation()

jest.useFakeTimers()

process.env[ConfigurationKeys.VERIFICATION_INTERVAL] = '15'
process.env[ConfigurationKeys.VERIFICATION_ENDPOINT_URL] =
  'https://gds.co.uk/verify'
process.env[ConfigurationKeys.STREAM_ID] = 'stream_id'

describe('startHealthCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    mockSendVerificationSignal.mockResolvedValue(true)
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
