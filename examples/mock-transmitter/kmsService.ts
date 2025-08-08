import { GetPublicKeyCommand, KMSClient, SignCommand } from '@aws-sdk/client-kms'

export async function signedJWTWithKMS(payload: any): Promise<string> {
    const kmsClient = new KMSClient({ region: process.env['AWS_REGION'] || 'eu-west-1' })

    const header = {
        alg: 'PS256',
        typ: 'JWT'
    }

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signingInput = `${encodedHeader}.${encodedPayload}`

    const kmsKeyId = process.env['KMS_KEY_ID']

    if (!kmsKeyId) {
        throw new Error('KMS_KEY_ID environment variable not set')
    }

    const signCommand = new SignCommand({
        KeyId: kmsKeyId,
        Message: Buffer.from(signingInput),
        MessageType: 'RAW',
        SigningAlgorithm: 'RSASSA_PSS_SHA_256'
    })

    const signResult = await kmsClient.send(signCommand);
    const signature = Buffer.from(signResult.Signature as Uint8Array).toString('base64url')

    return `${signingInput}.${signature}`
}

export interface KmsPublicKeyData {
    keyId: string,
    publicKey: Uint8Array
}

export async function getKmsPublicKey(keyArn: string): Promise<KmsPublicKeyData> {
    const kmsClient = new KMSClient({ region: process.env['AWS_REGION'] || 'eu-west-1' })

    const getKeyCommand = new GetPublicKeyCommand({
        KeyId: keyArn
    })

    const response = await kmsClient.send(getKeyCommand)

    if (!response.PublicKey || !response.KeyId) {
        throw new Error(`Failed to retrieve public key for ${keyArn}`)
    }

    return {
        keyId: response.KeyId,
        publicKey: response.PublicKey
    }
}