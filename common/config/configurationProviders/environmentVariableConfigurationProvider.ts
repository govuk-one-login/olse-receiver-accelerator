import { AbstractConfigurationProvider } from './abstractConfigurationProvider'

export class EnvironmentVariableConfigurationProvider extends AbstractConfigurationProvider {
  override async getAll(): Promise<Map<string, string>> {
    return new Map()
  }

  override get(key: string): string {
    const value = process.env[key]
    if (typeof value === 'string') {
      return value
    }
    throw new Error(`Missing required environment variable: ${key}`)
  }

  // eslint-disable-next-line
  override async initialise(): Promise<void> {}
}
