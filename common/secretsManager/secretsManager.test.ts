import { type SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { getSecret } from './secretsManager'

const mockSend = vi.fn()

vi.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: vi.fn().mockImplementation(function (
    this: SecretsManagerClient
  ) {
    this.send = mockSend
  }),
  GetSecretValueCommand: vi.fn()
}))

describe('getSecretFromSecretsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
