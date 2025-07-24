import { AbstractConfigurationProvider } from './AbstractConfigurationProvider'

export class EnvironmentVariableConfigurationProvider extends AbstractConfigurationProvider {
  get(key: string): string | undefined {
    return process.env[key]
  }

  getOrDefault(key: string, defaultValue: string): string {
    const value = process.env[key]
    return value ?? defaultValue
  }

  set(key: string, value: string) {
    process.env[key] = value
  }

  getAllKeys(): string[] {
    return Object.keys(process.env)
  }

  initialize(): void {
    console.log('Environment variable config provider initialised')
  }
}

export const config = new EnvironmentVariableConfigurationProvider()
