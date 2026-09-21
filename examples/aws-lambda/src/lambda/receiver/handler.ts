import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ConfigurationKeys } from "../../../../../common/config/configurationKeys";
import { getEnv } from "../../mock-transmitter/utils";
import { getParameter } from "../../../../../common/ssm/ssm";
import { getPublicKeyFromRemote } from "../../../../../src/vendor/publicKey/getPublicKey";
import { handleSignalRouting } from "../../../../../common/signalRouting/signalRouter";
import { httpErrorResponseMessages } from "../../../../../common/constants";
import { lambdaLogger as logger } from "../../../../../common/logging/logger";
import { validateJWTWithRemoteKey } from "../../../../../src/vendor/jwt/validateJWT";
import { validateSignalAgainstSchemas } from "../../../../../src/vendor/validateSchema/validateSchema";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Received event:", { event });
    const jwt = event.body;
    logger.info("Processing signal receiver request");
    if (!jwt) {
      logger.error("No JWT found in request body");
      logger.warn("Request missing body");
      return {
        body: JSON.stringify({
          description: "Request body is required",
          err: "invalid_request",
        }),
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
      };
    }
    const secretArn = process.env["RECEIVER_SECRET_ARN"];
    if (!secretArn) {
      logger.error("RECEIVER_SECRET_ARN environment variable is not set");
      return {
        body: JSON.stringify({
          description: "RECEIVER_SECRET_ARN environment variable is required",
          err: "internal_error",
        }),
        headers: { "Content-Type": "application/json" },
        statusCode: 500,
      };
    }

    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME);
    const jwksUrl = await getParameter(`/${stackName}/jwks-url`);

    const publicKey = getPublicKeyFromRemote(jwksUrl);
    logger.debug("Fetched public key from JWKS URL");

    let verifiedJwtBody;
    try {
      logger.debug("Validating JWT with remote key");
      verifiedJwtBody = await validateJWTWithRemoteKey(jwt, publicKey);
      logger.info("JWK validation successful");
    } catch (error) {
      logger.error("failed to validate JWT with remote key", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        body: JSON.stringify(httpErrorResponseMessages.invalid_key),
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
      };
    }

    const jwtPayload = verifiedJwtBody.payload;
    if (typeof jwtPayload === "undefined") {
      logger.warn("JWT payload is undefined");
      return {
        body: JSON.stringify({
          description:
            "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition.",
          err: "invalid_request",
        }),
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
      };
    }

    const schemaValidationResult = await validateSignalAgainstSchemas(jwtPayload);

    logger.debug("Schema validation result:", { schemaValidationResult });
    if (!schemaValidationResult.valid) {
      logger.warn("Schema validationg failed", { Error });
      return {
        body: JSON.stringify(httpErrorResponseMessages.invalid_request),
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
      };
    }
    logger.info("Schema validated successfully");

    const result = await handleSignalRouting(jwtPayload, schemaValidationResult.schema);

    if (result.valid) {
      logger.info("Signal routing processed successfully");
      return {
        body: "",
        headers: { "Content-Type": "application/json" },
        statusCode: 202,
      };
    } else {
      logger.error("failed to route signal");
      return {
        body: JSON.stringify(httpErrorResponseMessages.invalid_request),
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
      };
    }
  } catch (error) {
    logger.error("Unexpected error in receiver handler:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      body: JSON.stringify({
        description: "An internal error occurred",
        err: "internal_error",
      }),
      headers: { "Content-Type": "application/json" },
      statusCode: 500,
    };
  }
};
