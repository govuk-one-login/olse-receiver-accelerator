import { ConfigurationKeys } from './ConfigurationKeys'

export abstract class AbstractConfigurationProvider {
  private configMap = new Map<string, string>()

  abstract getAll(): Promise<Map<string, string>>

  get(key: string): string | undefined {
    return this.configMap.get(key)
  }

  getAllKeys(): string[] {
    return Object.values(ConfigurationKeys)
  }

  getNumber(key: string): number | null {
    const value = this.get(key)
    if (value === undefined) {
      return null
    }
    const result = parseInt(value, 10)
    return result
  }

  getOrDefault(key: string, defaultValue: string): string {
    const value = this.get(key)
    return value ?? defaultValue
  }

  delete(key: string): void {
    this.configMap.delete(key)
  }

  set(key: string, value: string): void {
    this.configMap.set(key, value)
  }

  async initialise(): Promise<void> {
    const allSecrets = await this.getAll()
    this.configMap = allSecrets
  }
}
