import { AbstractConfigurationProvider } from './AbstractConfigurationProvider'

export class EnvironmentVariableConfigurationProvider extends AbstractConfigurationProvider {
  async getAll(): Promise<Map<string, string>> {
    const keys = this.getAllKeys()
    const envVariables = new Map<string, string>()

    for (const key of keys) {
      const value = process.env[key]

      if (value) {
        envVariables.set(key, value)
      }
    }
    return Promise.resolve(envVariables)
  }
}

export const envVariableConfig = new EnvironmentVariableConfigurationProvider()
