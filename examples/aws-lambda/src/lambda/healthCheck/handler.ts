// oxlint-disable no-magic-numbers
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ConfigurationKeys } from "../../../../../common/config/configurationKeys";
import { getEnv } from "../../mock-transmitter/utils";
import { getParameter } from "../../../../../common/ssm/ssm";
import { getTokenFromCognito } from "../../../../../common/cognito/getTokenFromCognito";
import { lambdaLogger as logger } from "../../../../../common/logging/logger";

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Processing verification request", { event: event });

    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME);
    const verificationEndpointUrl = await getParameter(`/${stackName}/mock-verification-endpoint`);
    logger.debug("Verification endpoint url resolved", {
      verificationEndpointUrl,
    });

    const mockTxSecretArn = getEnv("MOCK_TX_SECRET_ARN");
    const access_token = await getTokenFromCognito(mockTxSecretArn);

    const verificationRequest = {
      state: "health-check-state",
      stream_id: "health-check-stream",
    };

    logger.debug("Sending verification signal");
    const response = await fetch(verificationEndpointUrl, {
      body: JSON.stringify(verificationRequest),
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    logger.info("Verification signal sent", {
      ok: response.ok,
      status: response.status,
    });

    if (response.status !== 204) {
      return {
        body: JSON.stringify({
          message: "Health check failed",
          status: response.status,
          success: false,
        }),
        statusCode: 500,
      };
    }

    return {
      body: JSON.stringify({
        message: "Health check passed",
        status: response.status,
        success: true,
      }),
      statusCode: 200,
    };
  } catch (error) {
    logger.error("Error processing request:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      body: JSON.stringify({
        message: "Health check failed",
        status: 500,
        success: false,
      }),
      statusCode: 500,
    };
  }
};
