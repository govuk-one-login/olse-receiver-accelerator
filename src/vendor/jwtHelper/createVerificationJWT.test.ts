import { createVerificationJwt } from './createVerificationJWT'
import { generateJWT } from '../../../src/vendor/auth/jwt'
import { ConfigurationKeys } from '../config/ConfigurationKeys'
import { baseLogger as logger } from '../../../common/logging/logger'

const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
jest.mock('../../../src/vendor/auth/jwt', () => ({
  generateJWT: jest.fn()
}))

jest.mock('../config/awsConfig', () => ({
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

describe('createVerificationJwt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env[ConfigurationKeys.ISSUER] = 'https://gds.co.uk'
      ; (generateJWT as jest.MockedFunction<typeof generateJWT>).mockResolvedValue(
        'mock.jwt.token'
      )
  })

  it('creates JWT with correct structure and state', async () => {
    const relyingPartyUrl = 'https://rp.co.uk/verify'
    const streamId = 'stream-1'

    const result = await createVerificationJwt(relyingPartyUrl, streamId)

    const mock = (
      generateJWT as jest.MockedFunction<typeof generateJWT>
    ).mockResolvedValue('mock.jwt.token').mock
    if (mock.calls.length === 0) {
      throw new Error('generateJWT was not called')
    }
    const firstCallArg = mock.calls[0]
    if (!firstCallArg) {
      throw new Error('generateJWT was not called')
    }
    const args = firstCallArg[0]
    expect(args.alg).toBe('PS256')
    expect(args.issuer).toBe('default-issuer')
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

    const mock = (
      generateJWT as jest.MockedFunction<typeof generateJWT>
    ).mockResolvedValue('mock.jwt.token').mock
    if (mock.calls.length === 0) {
      throw new Error('generateJWT was not called')
    }
    const firstCallArg = mock.calls[0]
    if (!firstCallArg) {
      throw new Error('generateJWT was not called')
    }
    const args = firstCallArg[0]
    expect(args.alg).toBe('PS256')
    expect(args.issuer).toBe('default-issuer')
    expect(args.jti).toMatch(/^verification-\d+$/)
    expect(args.audience).toBe(relyingPartyUrl)
    expect(args.payload).toEqual({ streamId: streamId })
    expect(args.useExpClaim).toBe(true)
    expect(result).toBe('mock.jwt.token')
  })

  it('handles generateJWT errors', async () => {
    const error = new Error('Error')

      ; (generateJWT as jest.MockedFunction<typeof generateJWT>).mockRejectedValue(
        error
      )

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
