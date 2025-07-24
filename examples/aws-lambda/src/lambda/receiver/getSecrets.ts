import {
  SecretsManagerClient,
  GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager'

interface Secrets {
  userPoolId: string
  userPoolClientId: string
  userPoolClientSecret: string
  userPoolArn: string
}

const client = new SecretsManagerClient({ region: 'eu-west-2' })

export const getSecrets = async (): Promise<Secrets> => {
  const command = new GetSecretValueCommand({
    SecretId: process.env['SECRET_ARN']
  })

  const response = await client.send(command)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return JSON.parse(response.SecretString!) as Secrets
}
