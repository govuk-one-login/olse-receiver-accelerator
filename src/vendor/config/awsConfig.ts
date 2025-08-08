import { awsSecretsManagerConfig } from './AWSSecretsManagerConfigurationProvider'

export const config = awsSecretsManagerConfig

void (async () => {
  await config.initialise()
})
