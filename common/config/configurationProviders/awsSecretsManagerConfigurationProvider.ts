import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { AbstractConfigurationProvider } from "./abstractConfigurationProvider";
import { lambdaLogger as logger } from "../../logging/logger";

export class AWSSecretsManagerConfigurationProvider extends AbstractConfigurationProvider {
  private readonly client: SecretsManagerClient;
  private readonly secretName: string;

  public constructor(secretName: string, region = "eu-west-2") {
    super();
    this.client = new SecretsManagerClient({ region });
    this.secretName = secretName;
  }

  public async getAll(): Promise<Map<string, string>> {
    const configMap = new Map<string, string>();

    try {
      const command = new GetSecretValueCommand({
        SecretId: this.secretName,
      });

      const response = await this.client.send(command);

      if (!response.SecretString) {
        throw new Error(`Secret ${this.secretName} is missing`);
      }

      const secretData: Record<string, unknown> = JSON.parse(response.SecretString) as Record<
        string,
        unknown
      >;

      for (const key in secretData) {
        const value = secretData[key];
        configMap.set(key, value as string);
      }

      logger.info(`Successfully loaded configuration parameters from secret: ${this.secretName}`);
    } catch (error) {
      logger.error("Error retrieving secret:", {
        error,
        secretName: this.secretName,
      });
      throw error;
    }
    return configMap;
  }
}
