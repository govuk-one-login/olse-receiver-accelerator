import { ConfigurationKeys } from "./ConfigurationKeys";

export abstract class AbstractConfigurationProvider {
    private configMap: Map<string, string> = new Map();

    abstract getAll(): Promise<Map<string, string>>

    async get(key: string): Promise<string | undefined> {
        return this.configMap.get(key)
    }

    async getAllKeys(): Promise<string[]> {
        return Object.values(ConfigurationKeys);
    }

    async getNumber(key: string): Promise<number | null> {
        const value = await this.get(key);
        if (value === undefined) {
            return null;
        }
        const result = parseInt(value, 10);
        return result ?? null
    }

    async getOrDefault(key: string, defaultValue: string): Promise<string | undefined> {
        const value = await this.get(key)
        return value ?? defaultValue
    }

    async initialise(): Promise<void> {
        const allSecrets = await this.getAll()
        this.configMap = allSecrets;
    }
}