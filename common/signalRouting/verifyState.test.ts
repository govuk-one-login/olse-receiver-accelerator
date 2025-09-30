import { CryptoKey, JWTVerifyResult } from 'jose'
import { getPublicKeyFromJWK } from '../../src/vendor/publicKey/getPublicKey'
import { validateJWT } from '../../src/vendor/jwt/validateJWT'
import { verifyStateJwt } from './verifyState'
import * as fs from 'fs'
import { ConfigurationKeys } from '../../common/config/configurationKeys'
import { config } from '../config/config'

jest.mock('../../src/vendor/jwt/validateJWT')
jest.mock('../../src/vendor/publicKey/getPublicKey')

const mockValidateJWT = jest.mocked(validateJWT)
const mockGetPublicKeyFromJWK = jest.mocked(getPublicKeyFromJWK)

describe('verifyStateJwt', () => {
  let readFileSpy: jest.SpyInstance

  beforeEach(async () => {
    jest.resetAllMocks()
    process.env[ConfigurationKeys.ISSUER] = 'test-issuer'

    readFileSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      return '{"someKey":"someKeyValue"}' as unknown as string
    })

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
    expect(readFileSpy).toHaveBeenCalled()
  })

  it('returns null for invalid JWT', async () => {
    mockValidateJWT.mockRejectedValue(new Error('Error'))

    const result = await verifyStateJwt('header.payload.signature')

    expect(result).toBeNull()
  })
})
