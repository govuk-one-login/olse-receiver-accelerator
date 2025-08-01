import { EnvironmentVariableConfigurationProvider } from './EnvironmentVariableConfigurationProvider'
// import { AwsSecretsManagerConfig } from "./AWSSecretsManagerConfigurationProvider";

export const config = new EnvironmentVariableConfigurationProvider()
//export const = new AWSSecretsMangerConfig()

void (async () => {
  await config.initialise()
})
