import { lambdaLogger as logger } from '../logging/logger'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { getSecretsManagerClient } from '../../examples/aws-lambda/src/sdk/sdkClient'

export const getSecret = async (
  secretName: string
): Promise<string | undefined> => {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName })
    const response = await getSecretsManagerClient().send(command)

    if (!response.SecretString) {
      throw new Error('Secret value is empty or not found')
    }

    return response.SecretString
  } catch (error) {
    logger.error(`Failed to retrieve secret "${secretName}":`, { error })
    return undefined
  }
}
