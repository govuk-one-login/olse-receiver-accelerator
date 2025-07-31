import { AbstractConfigurationProvider } from './AbstractConfigurationProvider';


export class EnvironmentVariableConfigurationProvider extends AbstractConfigurationProvider {

    constructor() {
        super()
    }

    async getAll(): Promise<Map<string, string>> {
        const keys = await this.getAllKeys()
        const envVariables = new Map<string, string>()

        for (const key of keys) {
            const value = process.env[key]


            if (value) {
                envVariables.set(key, value)
            }
        }
        return envVariables

    }

}

export const envVariableConfig = new EnvironmentVariableConfigurationProvider()
