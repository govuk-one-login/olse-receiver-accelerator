import { sendVerificationSignal } from './sendVerification'
import { createVerificationJwt } from './createVerificationJWT'
import { SignJWT } from 'jose'

jest.mock('./createVerificationJWT')
jest.mock('../config/config', () => ({
  config: {
    JWT_SECRET: 'test-secret',
    ISSUER: 'https://gds.co.uk'
  }
}))
jest.mock('jose')
jest.mock('crypto')

const signJwtChain = {
  setProtectedHeaders: jest.fn().mockReturnThis(),
  setExpirationTime: jest.fn().mockReturnThis(),
  sign: jest.fn().mockResolvedValue('signed-token')
}

;(SignJWT as unknown as jest.Mock).mockImplementation(() => signJwtChain)

const mockedCreateVerificationJwt =
  createVerificationJwt as unknown as jest.Mock
describe('sendVerificationSignal', () => {
  const mockRelyingPartyUrl = 'https://gds.co.uk'
  const mockStreamId = 'test-stream-id-1'

  beforeEach(() => {
    jest.clearAllMocks()

    mockedCreateVerificationJwt.mockResolvedValue('state-jwt')
  })

  it('returns true when response.status is 204', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 204 } as Response)

    const result = await sendVerificationSignal(
      mockRelyingPartyUrl,
      mockStreamId
    )

    expect(result).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(mockRelyingPartyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json'
      },
      body: JSON.stringify({ stream_id: mockStreamId, state: 'state-jwt' })
    })
  })

  it('returns false when response.ok is false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    } as Response)

    await expect(
      sendVerificationSignal(mockRelyingPartyUrl, mockStreamId)
    ).resolves.toBe(false)
  })

  it('returns false when an error is thrown', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('some error'))

    await expect(
      sendVerificationSignal(mockRelyingPartyUrl, mockStreamId)
    ).resolves.toBe(false)
  })
})
