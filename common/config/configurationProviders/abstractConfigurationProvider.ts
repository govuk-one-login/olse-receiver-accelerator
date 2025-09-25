import { ConfigurationKeys } from '../configurationKeys'

/**
 * Abstract base class for configuration providers.
 * Extend this class and implement getAll() to load config from your source.
 */
export abstract class AbstractConfigurationProvider {
  private configMap = new Map<string, string>()

  /**
   * Load configuration from your source. Must be implemented by subclasses.
   */
  abstract getAll(): Promise<Map<string, string>>

  /**
   * Get a required configuration value. Throws if missing.
   */
  get(key: string): string {
    const value = this.configMap.get(key)
    if (typeof value === 'string') {
      return value
    }
    throw new Error(`Missing required configuration: ${key}`)
  }

  /**
   * Get a configuration value as a number. Throws if missing or invalid.
   */
  getNumber(key: string): number {
    const value = this.get(key)
    const number = Number(value)
    if (!Number.isFinite(number)) {
      throw new Error(`Invalid type for ${key}: ${value}`)
    }
    return number
  }

  /**
   * Get all available configuration keys.
   */
  getAllKeys(): string[] {
    return Object.values(ConfigurationKeys)
  }

  /**
   * Remove a key from the cache.
   */
  delete(key: string): void {
    this.configMap.delete(key)
  }

  /**
   * Set a key-value pair in the cache.
   */
  set(key: string, value: string): void {
    this.configMap.set(key, value)
  }

  /**
   * Load and validate all configuration. Call this before using other methods.
   */
  async initialise(): Promise<void> {
    this.configMap = await this.getAll()

    const missingKeys = Object.values(ConfigurationKeys).filter(
      (key) => !this.configMap.has(key)
    )

    if (missingKeys.length > 0) {
      throw new Error(
        `Missing required configuration keys: ${missingKeys.join(', ')}`
      )
    }
  }
}
