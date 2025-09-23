import { ConfigurationKeys } from '../config/configurationKeys'

export abstract class AbstractConfigurationProvider {
  private configMap = new Map<string, string>()

  abstract getAll(): Promise<Map<string, string>>

  get(key: string): string {
    const value = this.configMap.get(key)
    if (typeof value === 'string') {
      return value
    }
    throw new Error(`Missing required configuration: ${key}`)
  }

  getNumber(key: string): number {
    const value = this.get(key)
    const number = Number(value)
    if (!Number.isFinite(number)) {
      throw new Error(`Invalid type for ${key}: ${value}`)
    }
    return number
  }

  getAllKeys(): string[] {
    return Object.values(ConfigurationKeys)
  }

  getOrDefault(key: string, defaultValue: string): string {
    const value = this.configMap.get(key)
    return value ?? defaultValue
  }

  delete(key: string): void {
    this.configMap.delete(key)
  }

  set(key: string, value: string): void {
    this.configMap.set(key, value)
  }

  async initialise(): Promise<void> {
    this.configMap = await this.getAll()
  }
}
