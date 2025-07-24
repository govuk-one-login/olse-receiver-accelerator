export abstract class AbstractConfigurationProvider {
  abstract get(key: string): string | undefined
  abstract set(key: string, value: string): void

  abstract getAllKeys(): string[]

  setMultipleKeys(configs: Record<string, string>): void {
    Object.entries(configs).forEach(([key, value]) => {
      this.set(key, value)
    })
  }

  abstract initialize(): void

  getNumber(key: string): number | undefined {
    const value = this.get(key)
    return value ? parseInt(value, 10) : undefined
  }
}
