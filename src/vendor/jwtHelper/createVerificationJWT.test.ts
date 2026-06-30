import { createVerificationJwt } from './createVerificationJWT'
import { generateJWT } from '../../../src/vendor/auth/jwt'
import { baseLogger } from '../../../common/logging/logger'

const loggerErrorSpy = vi.spyOn(baseLogger, 'error')

vi.mock('../../../src/vendor/auth/jwt', () => ({
  generateJWT: vi.fn()
}))

vi.mock('../../../common/config/config', () => ({
  config: {
    get: vi.fn().mockReturnValue('https://gds.co.uk')
  }
}))

const mockGenerateJWT = vi.mocked(generateJWT)

describe('createVerificationJwt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateJWT.mockResolvedValue('mock.jwt.token')
  })

  it('creates JWT with correct structure and state', async () => {
    const relyingPartyUrl = 'https://rp.co.uk/verify'
    const streamId = 'stream-1'

    const result = await createVerificationJwt(relyingPartyUrl, streamId)

    const mock = mockGenerateJWT.mock
    if (mock.calls.length === 0) {
      throw new Error('generateJWT was not called')
    }
    const firstCallArg = mock.calls[0]
    if (!firstCallArg) {
      throw new Error('generateJWT was not called')
    }
    const args = firstCallArg[0]
    expect(args.alg).toBe('RS256')
    expect(args.issuer).toBe('https://gds.co.uk')
    expect(args.jti).toMatch(/^verification-\d+$/)
    expect(args.audience).toBe(relyingPartyUrl)
    expect(args.payload).toEqual({ streamId: streamId })
    expect(args.useExpClaim).toBe(true)
    expect(result).toBe('mock.jwt.token')
  })

  it('creates JWT without state when not provided', async () => {
    const relyingPartyUrl = 'https://rp.co.uk/verify'
    const streamId = 'test-stream-id-001'

    const result = await createVerificationJwt(relyingPartyUrl, streamId)

    const mock = mockGenerateJWT.mock
    if (mock.calls.length === 0) {
      throw new Error('generateJWT was not called')
    }
    const firstCallArg = mock.calls[0]
    if (!firstCallArg) {
      throw new Error('generateJWT was not called')
    }
    const args = firstCallArg[0]
    expect(args.alg).toBe('RS256')
    expect(args.issuer).toBe('https://gds.co.uk')
    expect(args.jti).toMatch(/^verification-\d+$/)
    expect(args.audience).toBe(relyingPartyUrl)
    expect(args.payload).toEqual({ streamId: streamId })
    expect(args.useExpClaim).toBe(true)
    expect(result).toBe('mock.jwt.token')
  })

  it('handles generateJWT errors', async () => {
    const error = new Error('Error')
    mockGenerateJWT.mockRejectedValue(error)

    const relyingPartyUrl = 'https://rp.co.uk/verification'
    const streamId = 'default-stream-id-001'

    await expect(
      createVerificationJwt(relyingPartyUrl, streamId)
    ).rejects.toThrow('Failed to create verification JWT')

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error creating verification JWT:',
      expect.any(Object)
    )
  })
})
