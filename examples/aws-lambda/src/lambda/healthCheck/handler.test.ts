import { handler } from './handler'
import { sendVerificationSignal } from '../../../../express-container/verification/sendVerification'
import { createDefaultApiRequest } from '../../../../awsPayloads/defaultApiRequest'
import { mockLambdaContext } from '../../../../awsPayloads/mockLambdaContext'

jest.mock('../../../../express-container/verification/sendVerification')
jest.mock('../../../../express-container/config/globalConfig')

const mockSendVerificationSignal = sendVerificationSignal as jest.Mock

describe('handler', () => {
  it('returns 200 and response body when sendVerificationSignal resolves', async () => {
    const fakeResponse = { ok: true }
    mockSendVerificationSignal.mockResolvedValue(fakeResponse)
    const result = await handler(createDefaultApiRequest(), mockLambdaContext)
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify(fakeResponse))
  })
})
