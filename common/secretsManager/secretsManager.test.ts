import { getSecret } from './secretsManager'

const mockSend = jest.fn()

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: mockSend
  })),
  GetSecretValueCommand: jest.fn()
}))

describe('getSecretFromSecretsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should return secret string successfully', async () => {
    const mockSecretValue = 'test-secret-value-001'
    mockSend.mockResolvedValue({
      SecretString: mockSecretValue
    })

    const result = await getSecret('test-secret-name-001')

    expect(result).toBe(mockSecretValue)
  })
})
