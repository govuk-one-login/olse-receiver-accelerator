import { EnvironmentVariableConfigurationProvider } from './EnvironmentalVariableConfigurationProvider'
// import { AwsSecretsManagerConfig } from "./AWSSecretsManagerConfigurationProvider";

export const config = new EnvironmentVariableConfigurationProvider();
//export const = new AWSSecretsMangerConfig()

(async () => {
    await config.initialise()
})
