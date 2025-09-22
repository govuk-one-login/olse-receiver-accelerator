import { CryptoKey, JWTVerifyResult } from 'jose'
import { getPublicKeyFromJWK } from '../../src/vendor/publicKey/getPublicKey'
import { validateJWT } from '../../src/vendor/jwt/validateJWT'
import { verifyStateJwt } from './verifyState'
import * as fs from 'fs'
import { ConfigurationKeys } from '../../examples/express-container/config/ConfigurationKeys'
import { config } from '../../examples/express-container/config/globalConfig'

jest.mock('../../src/vendor/jwt/validateJWT')
jest.mock('../../src/vendor/publicKey/getPublicKey')

const mockValidateJWT = validateJWT as jest.MockedFunction<typeof validateJWT>
const mockGetPublicKeyFromJWK = getPublicKeyFromJWK as jest.MockedFunction<
  typeof getPublicKeyFromJWK
>

describe('verifyStateJwt', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    process.env[ConfigurationKeys.ISSUER] = 'test-issuer'
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation(() => '{"someKey":"someKeyValue"}')
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
  })

  it('returns null for invalid JWT', async () => {
    mockValidateJWT.mockRejectedValue(new Error('Error'))
    const result = await verifyStateJwt('header.payload.signature')
    expect(result).toBeNull()
  })
})
