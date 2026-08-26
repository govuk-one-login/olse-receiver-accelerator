import type { APIGatewayProxyResult } from "aws-lambda";

const commonHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

const NO_CONTENT_RESPONSE: APIGatewayProxyResult = {
  body: "",
  headers: commonHeaders,
  statusCode: 204,
};

const INVALID_REQUEST_RESPONSE: APIGatewayProxyResult = {
  body: JSON.stringify({
    error: "invalid_request",
    error_description: "The request is missing required params or contains invalid values",
  }),
  headers: commonHeaders,
  statusCode: 400,
};

const VERIFICATION_FORBIDDEN_RESPONSE: APIGatewayProxyResult = {
  body: JSON.stringify({
    error: "access_denied",
  }),
  headers: commonHeaders,
  statusCode: 403,
};

const INTERNAL_SERVER_ERROR_RESPONSE: APIGatewayProxyResult = {
  body: JSON.stringify({
    error: "server_error",
    error_description: "An internal server error occured",
  }),
  headers: commonHeaders,
  statusCode: 500,
};

export {
  NO_CONTENT_RESPONSE,
  INVALID_REQUEST_RESPONSE,
  VERIFICATION_FORBIDDEN_RESPONSE,
  INTERNAL_SERVER_ERROR_RESPONSE,
};
