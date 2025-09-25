import { getEnv } from '../../examples/aws-lambda/src/mock-transmitter/utils'
import { AbstractConfigurationProvider } from './configurationProviders/abstractConfigurationProvider'
import { AWSSecretsManagerConfigurationProvider } from './configurationProviders/awsSecretsManagerConfigurationProvider'
import { EnvironmentVariableConfigurationProvider } from './configurationProviders/environmentVariableConfigurationProvider'

function choose(): AbstractConfigurationProvider {
  const mode = process.env['CONFIG_PROVIDER']

  if (mode === 'aws') {
    return new AWSSecretsManagerConfigurationProvider(getEnv('SECRET_ARN'))
  }
  if (mode === 'test') {
    console.error('Invalid CONFIG_PROVIDER: test')
  }
  return new EnvironmentVariableConfigurationProvider()
}

export const config = choose()
