import { GetPublicKeyCommand, SignCommand } from '@aws-sdk/client-kms'
import { SET, KmsPublicKeyData } from './mockApiTxInterfaces'
import { getEnv } from './utils'
import { getKMSClient } from '../sdk/sdkClient'

export type JWTPayload = SET

export const signedJWTWithKMS = async (
  payload: JWTPayload
): Promise<string> => {
  const header = {
    alg: 'RS256',
    typ: 'secevent+jwt',
    kid: getEnv('KMS_KEY_ID')
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    'base64url'
  )
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  )

  const signingInput = `${encodedHeader}.${encodedPayload}`
  const KMS_KEY_ID = getEnv('KMS_KEY_ID')
  const signCommand = new SignCommand({
    KeyId: KMS_KEY_ID,
    Message: Buffer.from(signingInput),
    MessageType: 'RAW',
    SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256'
  })

  const signResult = await getKMSClient().send(signCommand)
  if (!signResult.Signature) {
    throw new Error('KMS signing failed')
  }
  const signature = Buffer.from(signResult.Signature).toString('base64url')

  return `${signingInput}.${signature}`
}

export const getKmsPublicKey = async (
  keyArn: string
): Promise<KmsPublicKeyData> => {
  const response = await getKMSClient().send(
    new GetPublicKeyCommand({ KeyId: keyArn })
  )

  if (!response.PublicKey || !response.KeyId) {
    throw new Error(`Failed to retrieve public key for ${keyArn}`)
  }

  return {
    keyId: response.KeyId,
    publicKey: response.PublicKey
  }
}
