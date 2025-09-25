import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { SSMClient } from '@aws-sdk/client-ssm'
import { getEnv } from '../mock-transmitter/utils'
import { KMSClient } from '@aws-sdk/client-kms'

let ssmClient: SSMClient | undefined
let kmsClient: KMSClient | undefined
let secretsManagerClient: SecretsManagerClient | undefined

export const getSSMClient = () =>
  (ssmClient ??= new SSMClient({ region: getEnv('AWS_REGION') }))
export const getKMSClient = () =>
  (kmsClient ??= new KMSClient({ region: getEnv('AWS_REGION') }))
export const getSecretsManagerClient = () =>
  (secretsManagerClient ??= new SecretsManagerClient({
    region: getEnv('AWS_REGION')
  }))
