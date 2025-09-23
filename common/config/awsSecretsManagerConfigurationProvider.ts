import {
  SecretsManagerClient,
  BatchGetSecretValueCommand
} from '@aws-sdk/client-secrets-manager'
import { AbstractConfigurationProvider } from './abstractConfigurationProvider'
import { baseLogger as logger } from '../../common/logging/logger'

export class AWSSecretsManagerConfigurationProvider extends AbstractConfigurationProvider {
  private client: SecretsManagerClient

  constructor(region = 'eu-west-2') {
    super()
    this.client = new SecretsManagerClient({ region })
  }

  async getAll(): Promise<Map<string, string>> {
    const secretKeys = this.getAllKeys()
    const retrievedSecrets = new Map<string, string>()
    try {
      const command = new BatchGetSecretValueCommand({
        SecretIdList: secretKeys
      })
      const response = await this.client.send(command)
      if (response.SecretValues) {
        for (const secret of response.SecretValues) {
          if (secret.Name && secret.SecretString) {
            retrievedSecrets.set(secret.Name, secret.SecretString)
          }
        }
      }
    } catch (error) {
      logger.error('Error retrieving secrets:', { error, secretKeys })
      return retrievedSecrets
    }
    return retrievedSecrets
  }
}

export const awsSecretsManagerConfig =
  new AWSSecretsManagerConfigurationProvider()
