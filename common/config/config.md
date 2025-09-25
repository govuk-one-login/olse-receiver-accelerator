# Configuration Overview

This configuration implementation provides a flexible way to manage application configuration from one of multiple configuration providers (e.g., environment variables, AWS Secrets Manager). Providers are pluggable and can be extended as needed.

## Key Components

- **ConfigurationKeys**: List of all required configuration keys used by the app (configurationKeys.ts).
- **AbstractConfigurationProvider**: Base class for all providers. Defines the contract and utility methods for config access.
  - Provides methods like get(key), getNumber(key), and initialise().
  - Enforces that all required keys are present (unless overridden).

## Built-in Providers

- **EnvironmentVariableConfigurationProvider**: Loads config from environment variables.
- **AWSSecretsManagerConfigurationProvider**: Loads config from an AWS Secrets Manager secret.

## How Provider Selection Works

The provider is chosen at runtime based on the CONFIG_PROVIDER environment variable:

- aws: Uses AWSSecretsManagerConfigurationProvider (requires SECRET_ARN env var).
- Any other value (or unset): Uses EnvironmentVariableConfigurationProvider.

Example:

export CONFIG_PROVIDER=aws
export SECRET_ARN=secret_arn

## Usage

Import and initialise the config at app startup:

import { config, configReady } from './common/config/config'

await configReady()
const clientId = config.get('CLIENT_ID')
const interval = config.getNumber('VERIFICATION_INTERVAL')

## Adding a New Configuration Provider

1. Create a new provider class extending AbstractConfigurationProvider in configurationProviders/.
2. Implement async getAll(): Promise<Map<string, string>> to fetch and return all config values.
3. Export an instance of your provider (e.g., export const myProvider = new MyProvider()).
4. Update the choose() function in config.ts to support selecting your provider (e.g., via a new CONFIG_PROVIDER value).

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

Then update choose() in config.ts:

```typescript
import { myCustomProvider } from './configurationProviders/myCustomProvider'
function choose() {
  if (process.env['CONFIG_PROVIDER'] === 'custom') return myCustomProvider
  // ...existing logic
}
```

## Accessing Configuration

Use the utility methods from AbstractConfigurationProvider:

- config.get(key) – Get a string value (throws if missing)
- config.getNumber(key) – Get a numeric value
- config.getOrDefault(key, defaultValue) – Get a value or fallback

## Notes

- All required keys are defined in ConfigurationKeys.
- The config is validated on initialisation; missing keys will throw an error.
- Providers can be swapped by changing the CONFIG_PROVIDER environment variable.
