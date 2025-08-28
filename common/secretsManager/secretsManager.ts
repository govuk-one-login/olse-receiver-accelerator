import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { getEnv } from "../../examples/aws-lambda/src/mock-transmitter/utils";

export const getSecret = async (secretName: string): Promise<string | undefined> => {
    const client = new SecretsManagerClient({
        region: getEnv("AWS_REGION") || 'eu-west-2'
    })
    try {
        const command = new GetSecretValueCommand({
            SecretId: secretName
        })

        const response = await client.send(command)

        if (!response.SecretString) {
            throw new Error('Secret value is empty or not found')
        }
        return response.SecretString
    } catch (error) {
        console.error('Failed to retrive secret from secrets manager:', error)
        return undefined
    }
}