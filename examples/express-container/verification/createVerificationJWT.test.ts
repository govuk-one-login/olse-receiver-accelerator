import { createVerificationJwt } from './createVerificationJWT'
import { generateJWT } from '../../../src/vendor/auth/jwt'
import { ConfigurationKeys } from '../config/ConfigurationKeys'
import { config } from '../config/globalConfig'
import { baseLogger as logger } from '../../../common/logging/logger'
const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
jest.mock('../../../src/vendor/auth/jwt', () => ({
  generateJWT: jest.fn()
}))

describe('createVerificationJwt', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    process.env[ConfigurationKeys.ISSUER] = 'https://gds.co.uk'
    await config.initialise()
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

    const relyingPartyUrl = 'https://rp.co.uk/verification'
    const streamId = 'default-stream-id-001'

    await expect(
      createVerificationJwt(relyingPartyUrl, streamId)
    ).rejects.toThrow('Failed to create verification JWT')

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error creating verification JWT:',
      { error }
    )
  })
})
