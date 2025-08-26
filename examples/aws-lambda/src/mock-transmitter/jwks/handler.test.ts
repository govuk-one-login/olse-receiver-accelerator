import { getKmsPublicKey } from '../kmsService'
import { getEnv } from '../utils'
import { handler, jwkArray } from './handler'

jest.mock('../utils')
jest.mock('../kmsService')
jest.mock('./createJwksFromRawPublicKey', () => ({
  createJwkFromRawPublicKey: jest.fn(() => ({
    kty: 'RSA',
    kid: 'test-key-id-001',
    n: 'keyModulus456',
    e: 'keyExpontent456'
  }))
}))

const mockGetEnv = jest.mocked(getEnv)
const mockGetKmsPublicKey = jest.mocked(getKmsPublicKey)

describe('JWKS handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jwkArray.length = 0
  })

  it('processes and returns all keys successfully', async () => {
    const mockPublicKey = {
      keyId: 'test-key-id-001',
      publicKey: new Uint8Array([1, 2, 3])
    }

    mockGetEnv.mockReturnValue('test-kms-key-001')
    mockGetKmsPublicKey.mockResolvedValue(mockPublicKey)

    const result = await handler()

    expect(result.statusCode).toBe(200)
  })

  it('returns 500 when key retrieve fails', async () => {
    mockGetEnv.mockReturnValue('test-kms-key-001')
    mockGetKmsPublicKey.mockRejectedValue(new Error('Error'))
    const result = await handler()

    expect(result.statusCode).toBe(500)
  })
})
