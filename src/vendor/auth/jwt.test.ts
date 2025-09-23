import { generateJWTPayload } from '../types'
import { generateJWT } from './jwt'
import { getSecret } from '../../../common/secretsManager/secretsManager'

jest.mock('../../../common/secretsManager/secretsManager')

const mockedGetSecret = jest.mocked(getSecret)

const payload: generateJWTPayload = {
  alg: 'RS256',
  audience: 'https://audience.example.com',
  issuer: 'https://issuer.example.com',
  jti: '123456',
  payload: {},
  useExpClaim: true
}

describe('generateJWT', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should throw error when private key is missing from Secrets Manager', async () => {
    mockedGetSecret.mockResolvedValue(undefined)
    await expect(generateJWT(payload)).rejects.toThrow(
      'Unable to get private key from Secrets Manager'
    )
  })

  test('should throw error when private key secret contains invalid JSON', async () => {
    mockedGetSecret.mockResolvedValue('not-json')
    await expect(generateJWT(payload)).rejects.toThrow()
  })

  test('should throw error when privateKey field is missing in secret', async () => {
    mockedGetSecret.mockResolvedValue(JSON.stringify({}))
    await expect(generateJWT(payload)).rejects.toThrow(
      'Private key not found in secret'
    )
  })

  test('should throw error when privateKey field is invalid JSON', async () => {
    mockedGetSecret.mockResolvedValue(
      JSON.stringify({ privateKey: 'not-json' })
    )
    await expect(generateJWT(payload)).rejects.toThrow()
  })
})
