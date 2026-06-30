import { CryptoKey, JWTVerifyResult } from 'jose'
import { getPublicKeyFromJWK } from '../../src/vendor/publicKey/getPublicKey'
import { validateJWT } from '../../src/vendor/jwt/validateJWT'
import { verifyStateJwt } from './verifyState'
import { ConfigurationKeys } from '../../common/config/configurationKeys'
import { config } from '../config/config'
import { readFileSync } from 'fs'

vi.mock('../../src/vendor/jwt/validateJWT')
vi.mock('../../src/vendor/publicKey/getPublicKey')
vi.mock('fs')

const mockValidateJWT = vi.mocked(validateJWT)
const mockGetPublicKeyFromJWK = vi.mocked(getPublicKeyFromJWK)
const mockReadFileSync = vi.mocked(readFileSync)

describe('verifyStateJwt', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    process.env[ConfigurationKeys.ISSUER] = 'test-issuer'

    mockReadFileSync.mockReturnValue('{"someKey":"someKeyValue"}')

    mockGetPublicKeyFromJWK.mockResolvedValue({} as CryptoKey)
    await config.initialise()
  })

  it('verifies valid JWT and return payload', async () => {
    const mockPayload = { requested_at: Math.floor(Date.now() / 1000) }
    mockValidateJWT.mockResolvedValue({
      payload: mockPayload
    } as unknown as JWTVerifyResult)

    const result = await verifyStateJwt('header.payload.signature')

    expect(result).toEqual(mockPayload)
    expect(mockReadFileSync).toHaveBeenCalled()
  })

  it('returns null for invalid JWT', async () => {
    mockValidateJWT.mockRejectedValue(new Error('Error'))

    const result = await verifyStateJwt('header.payload.signature')

    expect(result).toBeNull()
  })
})
