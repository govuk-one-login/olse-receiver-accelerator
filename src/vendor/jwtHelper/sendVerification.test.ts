import { sendVerificationSignal } from './sendVerification'
import { createVerificationJwt } from './createVerificationJWT'

vi.mock('./createVerificationJWT')
vi.mock('jose')
vi.mock('crypto')

const mockedCreateVerificationJwt = vi.mocked(createVerificationJwt)
describe('sendVerificationSignal', () => {
  const mockRelyingPartyUrl = 'https://gds.co.uk'
  const mockStreamId = 'test-stream-id-1'

  beforeEach(() => {
    vi.clearAllMocks()

    mockedCreateVerificationJwt.mockResolvedValue('state-jwt')
  })

  it('returns true when response.ok is true', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response)

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
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    } as Response)

    await expect(
      sendVerificationSignal(mockRelyingPartyUrl, mockStreamId)
    ).resolves.toBe(false)
  })

  it('returns false when an error is thrown', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('some error'))

    await expect(
      sendVerificationSignal(mockRelyingPartyUrl, mockStreamId)
    ).resolves.toBe(false)
  })
})
