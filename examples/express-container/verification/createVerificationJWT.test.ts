import { createVerificationJwt } from './createVerificationJWT'
import { generateJWT } from '../../../src/vendor/auth/jwt'
import { config } from '../config/EnvironmentalVariableConfigurationProvider'
import { ConfigurationKeys } from '../config/ConfigurationKeys'

jest.mock('../../../src/vendor/auth/jwt', () => ({
  generateJWT: jest.fn()
}))

describe('createVerificationJwt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    config.set(ConfigurationKeys.ISSUER, 'https://gds.co.uk')
    ;(generateJWT as jest.MockedFunction<typeof generateJWT>).mockResolvedValue(
      'mock.jwt.token'
    )
  })

  it('creates JWT with correct structure and state', async () => {
    const relyingPartyUrl = 'https://rp.co.uk/verify'
    const streamId = 'stream-1'

    const result = await createVerificationJwt(relyingPartyUrl, streamId)

    expect(generateJWT).toHaveBeenCalledWith({
      payload: {
        streamId: streamId
      },
      alg: 'PS256',
      issuer: 'https://gds.co.uk',
      // eslint-disable-next-line
      jti: expect.stringMatching(/^verification-\d+$/),
      audience: relyingPartyUrl,
      useExpClaim: true
    })
    expect(result).toBe('mock.jwt.token')
  })

  it('creates JWT without state when not provided', async () => {
    const relyingPartyUrl = 'https://rp.co.uk/verify'
    const streamId = 'test-stream-id-001'

    const result = await createVerificationJwt(relyingPartyUrl, streamId)

    expect(generateJWT).toHaveBeenCalledWith({
      payload: {
        streamId: streamId
      },
      alg: 'PS256',
      issuer: 'https://gds.co.uk',
      // eslint-disable-next-line
      jti: expect.stringMatching(/^verification-\d+$/),
      audience: relyingPartyUrl,
      useExpClaim: true
    })

    expect(result).toBe('mock.jwt.token')
  })

  it('handles generateJWT errors', async () => {
    const error = new Error('Error')

    ;(generateJWT as jest.MockedFunction<typeof generateJWT>).mockRejectedValue(
      error
    )

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const relyingPartyUrl = 'https://rp.co.uk/verification'
    const streamId = 'default-stream-id-001'

    await expect(
      createVerificationJwt(relyingPartyUrl, streamId)
    ).rejects.toThrow('Failed to create verification JWT')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error creating verification JWT:',
      error
    )
  })
})
