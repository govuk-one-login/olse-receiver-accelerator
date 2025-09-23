import { AbstractConfigurationProvider } from './abstractConfigurationProvider'
import { EnvironmentVariableConfigurationProvider } from './environmentVariableConfigurationProvider'
import { awsSecretsManagerConfig } from './awsSecretsManagerConfigurationProvider'

function choose(): AbstractConfigurationProvider {
  const mode = process.env['CONFIG_PROVIDER']
  if (mode === 'aws') return awsSecretsManagerConfig
  if (mode === 'test') console.error('Invalid CONFIG_PROVIDER: test')
  return new EnvironmentVariableConfigurationProvider()
}

export const config = choose()
export function configReady(): Promise<void> {
  return config.initialise()
}
