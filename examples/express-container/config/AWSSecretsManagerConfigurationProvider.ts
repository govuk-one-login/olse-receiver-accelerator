import { AbstractConfigurationProvider } from './AbstractConfigurationProvider';
import { SecretsManagerClient, BatchGetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

class AWSSecretsManagerConfigurationProvider extends AbstractConfigurationProvider {
    private client: SecretsManagerClient;

    constructor(region = 'eu-west-1') {
        super()
        this.client = new SecretsManagerClient({
            region: region
        });
    }

    async getAll(): Promise<Map<string, string>> {
        const secretKeys = await this.getAllKeys();
        const retrievedSecrets = new Map<string, string>();

        try {
            const command = new BatchGetSecretValueCommand({
                SecretIdList: secretKeys
            })
            const response = await this.client.send(command)

            if (response.SecretValues) {
                for (const secret of response.SecretValues) {
                    if (secret.Name && secret.SecretString) {
                        retrievedSecrets.set(secret.Name, secret.SecretString)
                    }
                }
            }
        } catch (error: any) {
            return retrievedSecrets;
        }

        return retrievedSecrets
    }
}

export const awsSecretsManagerConfig = new AWSSecretsManagerConfigurationProvider()

