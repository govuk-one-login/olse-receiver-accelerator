import { handler } from './handler'
import { sendVerificationSignal } from '../../../../express-container/verification/sendVerification'
import { createDefaultApiRequest } from '../../../../awsPayloads/defaultApiRequest'
import { mockLambdaContext } from '../../../../awsPayloads/mockLambdaContext'

jest.mock('../../../../express-container/config/globalConfig', () => ({
  config: {
    getOrDefault: jest.fn().mockImplementation((key, defaultValue) => {
      if (key === 'VERIFICATION_ENDPOINT_URL') {
        return 'https://rp.co.uk/verify'
      } else if (key === 'STREAM_ID') {
        return 'default-stream-id'
      }
      return defaultValue as string
    })
  }
}))
jest.mock(
  '../../../../express-container/verification/sendVerification',
  () => ({
    sendVerificationSignal: jest.fn()
  })
)

const mockSendVerificationSignal =
  sendVerificationSignal as jest.MockedFunction<typeof sendVerificationSignal>

describe('handler', () => {
  it('returns 200 and response body when sendVerificationSignal resolves', async () => {
    const fakeResponse = { ok: true }
    mockSendVerificationSignal.mockResolvedValue(fakeResponse)
    const result = await handler(createDefaultApiRequest(), mockLambdaContext)
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify(fakeResponse))
    expect(mockSendVerificationSignal).toHaveBeenCalledWith(
      'https://rp.co.uk/verify',
      'default-stream-id'
    )
  })
})
