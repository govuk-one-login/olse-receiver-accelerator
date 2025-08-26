import { KMSClient } from '@aws-sdk/client-kms'
import { signedJWTWithKMS, getKmsPublicKey } from './kmsService'
import { SET } from './mockApiTxInterfaces'

jest.mock('@aws-sdk/client-kms')

const mockKMSClient = jest.mocked(KMSClient)
const mockSend = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  mockKMSClient.mockImplementation(
    () => ({ send: mockSend }) as unknown as KMSClient
  )
  process.env['AWS_REGION'] = 'eu-west-2'
  process.env['KMS_KEY_ID'] = 'test-key-001'
})

describe('signedJwtWithKms', () => {
  it('creates valid jwt', async () => {
    const mockSignature = new Uint8Array([1, 2, 3])
    mockSend.mockResolvedValue({
      Signature: mockSignature
    })

    const payload = { sub: 'user001', exp: 123 }
    const result = await signedJWTWithKMS(payload as unknown as SET)

    expect(result.split('.')).toHaveLength(3)
  })

  it('throws error when KMS_KEY_ID not set', async () => {
    delete process.env['KMS_KEY_ID']
    await expect(signedJWTWithKMS({} as unknown as SET)).rejects.toThrow(
      'Missing environment variable: KMS_KEY_ID'
    )
  })

  it('throws error when KMS sign fails', async () => {
    mockSend.mockResolvedValue({ Signature: null })

    await expect(signedJWTWithKMS({} as unknown as SET)).rejects.toThrow(
      'KMS signing failed'
    )
  })
})

describe('getKmsPublicKey', () => {
  it('gets public key successfully', async () => {
    const mockPublicKey = new Uint8Array([1, 2, 3])
    const mockKeyId = 'test-key-id-001'

    mockSend.mockResolvedValue({
      PublicKey: mockPublicKey,
      KeyId: mockKeyId
    })

    const result = await getKmsPublicKey('key-arn')

    expect(result).toEqual({
      keyId: mockKeyId,
      publicKey: mockPublicKey
    })
  })
  it('throws error when get public key fails', async () => {
    mockSend.mockResolvedValue({
      PublicKey: null,
      KeyId: null
    })

    await expect(getKmsPublicKey('key-arn')).rejects.toThrow(
      'Failed to retrieve public key for key-arn'
    )
  })
})
