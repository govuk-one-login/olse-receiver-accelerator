# Configuration Overview

This configuration implementation provides a way to manage application configuration using environment variables by default. The provider can be extended if needed, but currently only environment variable configuration is supported out of the box.

## Key Components

- **ConfigurationKeys**: List of all required configuration keys used by the app (configurationKeys.ts).
- **AbstractConfigurationProvider**: Base class for all providers. Defines the contract and utility methods for config access.
  - Provides methods like get(key), getNumber(key), and initialise().
  - Enforces that all required keys are present (unless overridden).

## Built-in Providers

- **EnvironmentVariableConfigurationProvider**: Loads config from environment variables.
- **AWSSecretsManagerConfigurationProvider**: Loads config from an AWS Secrets Manager secret.

## Provider Selection

Currently, the EnvironmentVariableConfigurationProvider is used and exported in config.ts.

## Usage

Import the config at app startup:

import { config } from './common/config/config'

const clientId = config.get('CLIENT_ID')
const interval = config.getNumber('VERIFICATION_INTERVAL')

## Adding a New Configuration Provider

If you want to add support for a new configuration source, create a new provider class extending AbstractConfigurationProvider in configurationProviders/, and export an instance from config.ts. You will need to update config.ts to use your new provider.

## Example: Adding a Custom Provider

```typescript
// configurationProviders/myCustomProvider.ts
import { AbstractConfigurationProvider } from './abstractConfigurationProvider'
export class MyCustomProvider extends AbstractConfigurationProvider {
  async getAll() {
    // fetch config from your source
    return new Map([['CLIENT_ID', 'abc']])
  }
}
export const myCustomProvider = new MyCustomProvider()
```

Then update config.ts:

```typescript
import { myCustomProvider } from './configurationProviders/myCustomProvider'
export const config = myCustomProvider
```

## Accessing Configuration

Use the utility methods from AbstractConfigurationProvider:

- config.get(key) – Get a string value (throws if missing)
- config.getNumber(key) – Get a numeric value
- config.getOrDefault(key, defaultValue) – Get a value or fallback

## Notes

- All required keys are defined in ConfigurationKeys.
- The config is validated on initialisation; missing keys will throw an error.
- To use a different provider, update config.ts to export an instance of your custom provider.
