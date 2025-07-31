The configuration provider is an abstracted system to require minimal implementation when adding additional providers

- ConfigurationKeys - List of config keys used by app
- AbstractConfigurationProvider
  - Holds a a config data map of tyype Map<string,string>
  - A single abstract method of getall()
  - Utility accessors for the map
  - initialise used to populate config data map

Current built in providers

    EnvironmentVariableConfigurationProvider
    AWSSecretsManagerConfigurationProvider

Adding another provider

1. Create a class xxxxConfigurationProvider extensiong AbstractConfigurationProvider
2. Implement `async getAll(): Promise<Map<string,string>> to fetch config data
3. Export a single instance for app use for example `export const config = newConfigProvider()`

Integrating a provider

1. Instantate chosen provider and invoke initialise() within `globalConfig.ts`
2. Use utility accessors from AbstractConfigurationProvider for example `config.get()` or `config.getNumber()` to fetch config data from config map
