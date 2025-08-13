import { createPublicKey, KeyObject } from 'crypto'
import {
  createJwkFromRawPublicKey,
  uint8ArrayToBase64
} from './createJwksFromRawPublicKey'

jest.mock('crypto')

const mockCreatePublicKey = jest.mocked(createPublicKey)

describe('uint8ArrayToBase64', () => {
  it('converts uint8 to base 64', () => {
    const result = uint8ArrayToBase64(new Uint8Array([1, 2, 3]))
    expect(result).toBe('AQID')
  })
})

describe('createJwkFromRawPublicKey', () => {
  it('creates jwk successfully', () => {
    const mockJwk = { kty: 'RSA', n: 'test-001' }
    mockCreatePublicKey.mockReturnValue({
      export: jest.fn().mockReturnValue(mockJwk)
    } as unknown as KeyObject)

    const result = createJwkFromRawPublicKey({
      keyId: 'test-key-001',
      publicKey: new Uint8Array([1, 2, 3])
    })

    expect(result['kid']).toBe('test-key-001')
  })

  it('throws error when fails to create public key', () => {
    mockCreatePublicKey.mockImplementation(() => {
      throw new Error('Invalid key')
    })

    expect(() =>
      createJwkFromRawPublicKey({
        keyId: 'test-key-001',
        publicKey: new Uint8Array([1, 2, 3])
      })
    ).toThrow(
      'Could not create Public Key. Imported key may be in an incorrect format'
    )
  })
})
