// oxlint-disable no-magic-numbers
import type { APIGatewayProxyResult } from "aws-lambda";
import type { JsonWebKey } from "node:crypto";
import { createJwkFromRawPublicKey } from "./createJwksFromRawPublicKey";
import { getEnv } from "../utils";
import { getKmsPublicKey } from "../kmsService";
import { lambdaLogger as logger } from "../../../../../common/logging/logger";

const jwkArray: JsonWebKey[] = [];

const SIGNING_KEY_ENV_VAR_NAMES = ["KMS_KEY_ID"];
const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    jwkArray.length = 0;
    const promiseArray = SIGNING_KEY_ENV_VAR_NAMES.map(async (envVar) => {
      const envValue = getEnv(envVar);
      const publicKeyData = await getKmsPublicKey(envValue);
      logger.info("Retrived public key from KMS", {
        keyId: publicKeyData.keyId,
      });
      const jwk = createJwkFromRawPublicKey(publicKeyData.publicKey, publicKeyData.keyId);
      logger.info("Created JWK from public key", { jwk });
      jwkArray.push(jwk);
    });

    const res = await Promise.allSettled(promiseArray);

    let failedCount = 0;
    for (const promise of res) {
      if (promise.status === "rejected") {
        logger.error("Failed to create a JWK", {
          reason: String(promise.reason),
        });
        failedCount += 1;
      }
    }

    if (failedCount === 0) {
      logger.info("Returning jwks", { keys: jwkArray });
      return {
        body: JSON.stringify({ keys: jwkArray }),
        statusCode: 200,
      };
    } else {
      return {
        body: JSON.stringify({ message: "Internal Server Error" }),
        statusCode: 500,
      };
    }
  } catch {
    return {
      body: JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        error_description: "unexpected error occured",
      }),
      statusCode: 500,
    };
  }
};

export { jwkArray, handler };
