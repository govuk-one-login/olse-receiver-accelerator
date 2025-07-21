import { createStateJwt, createVerificationJwt } from './verification-jwt'
import { generateJWT } from '../../../src/vendor/auth/jwt'

jest.mock('../../../src/vendor/auth/jwt', () => ({
  generateJWT: jest.fn()
}))

const mockGenerateJWT = generateJWT as jest.MockedFunction<typeof generateJWT>

const originalEnv = process.env

describe('createVerificationJwt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env['JWT_ISSUER'] = 'issuer'
    ;(generateJWT as jest.MockedFunction<typeof generateJWT>).mockResolvedValue(
      'mock.jwt.token'
    )
  })

  it('creates JWT with correct structure and state', async () => {
    const relyingPartyUrl = 'https://rp.co.uk/verify'
    const streamId = 'stream-1'
    const state = 'default-state'

    const result = await createVerificationJwt(relyingPartyUrl, streamId, {
      state
    })

    expect(generateJWT).toHaveBeenCalledWith({
      payload: {
        sub_id: {
          format: 'opaque',
          id: streamId
        },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {
            state: state
          }
        }
      },
      alg: 'PS256',
      issuer: 'https://gds.com',
      // eslint-disable-next-line
      jti: expect.stringMatching(/^verification-\d+$/),
      audience: relyingPartyUrl,
      useExpClaim: true
    })
    expect(result).toBe('mock.jwt.token')
  })

  it('creates JWT without state when not provided', async () => {
    const relyingPartyUrl = 'https://rp.com/verify'
    const streamId = 'test-stream-id-001'

    const result = await createVerificationJwt(relyingPartyUrl, streamId)

    expect(generateJWT).toHaveBeenCalledWith({
      payload: {
        sub_id: {
          format: 'opaque',
          id: streamId
        },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
        }
      },
      alg: 'PS256',
      issuer: 'https://gds.com',
      // eslint-disable-next-line
      jti: expect.stringContaining('verification-'),
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

describe('createStateJwt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env['JWT_ISSUER'] = 'test-issuer'
    mockGenerateJWT.mockResolvedValue('header.payload.signature')
  })

  it('creates state JWT with correct payload', async () => {
    const streamId = 'test-stream-001'
    const relyingPartyUrl = 'https://gds.co.uk/verify'

    const result = await createStateJwt(streamId, relyingPartyUrl)

    expect(mockGenerateJWT)
    expect(result).toBe('header.payload.signature')
  })
})
