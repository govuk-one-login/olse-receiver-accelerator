import { EnvironmentVariableConfigurationProvider } from './EnvironmentalVariableConfigurationProvider'
// import { AwsSecretsManagerConfig } from "./AWSSecretsManagerConfigurationProvider";

export const config = new EnvironmentVariableConfigurationProvider();
//export const = new AWSSecretsMangerConfig()

void (async () => {
    await config.initialise()
})
