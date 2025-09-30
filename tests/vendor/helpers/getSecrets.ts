import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { getSecretsManagerClient } from '../../../examples/aws-lambda/src/sdk/sdkClient'

export interface Secrets {
  userPoolClientId: string
  userPoolClientSecret: string
  domain: string
}

export const getSecrets = async (secretArn: string): Promise<Secrets> => {
  const command = new GetSecretValueCommand({ SecretId: secretArn })
  const response = await getSecretsManagerClient().send(command)

  if (!response.SecretString) {
    throw new Error(`Secret "${secretArn}" is empty or not found`)
  }

  return JSON.parse(response.SecretString) as Secrets
}
