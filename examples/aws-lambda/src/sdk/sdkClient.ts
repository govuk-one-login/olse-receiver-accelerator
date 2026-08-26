// oxlint-disable init-declarations
import { KMSClient } from "@aws-sdk/client-kms";
import { SSMClient } from "@aws-sdk/client-ssm";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { getEnv } from "../mock-transmitter/utils";

let ssmClient: SSMClient | undefined;
let kmsClient: KMSClient | undefined;
let secretsManagerClient: SecretsManagerClient | undefined;

const getSSMClient = (): SSMClient | undefined =>
  (ssmClient ??= new SSMClient({ region: getEnv("AWS_REGION") }));
const getKMSClient = (): KMSClient | undefined =>
  (kmsClient ??= new KMSClient({ region: getEnv("AWS_REGION") }));
const getSecretsManagerClient = (): SecretsManagerClient | undefined =>
  (secretsManagerClient ??= new SecretsManagerClient({
    region: getEnv("AWS_REGION"),
  }));

export { getSSMClient, getKMSClient, getSecretsManagerClient };
