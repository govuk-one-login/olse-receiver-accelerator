import { APIGatewayProxyResult } from 'aws-lambda'

const commonHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
}

export const NO_CONTENT_RESPONSE: APIGatewayProxyResult = {
  statusCode: 204,
  headers: commonHeaders,
  body: ''
}

export const INVALID_REQUEST_RESPONSE: APIGatewayProxyResult = {
  statusCode: 400,
  headers: commonHeaders,
  body: JSON.stringify({
    error: 'invalid_request',
    error_description:
      'The request is missing required params or contains invalid values'
  })
}

export const VERIFICATION_FORBIDDEN_RESPONSE: APIGatewayProxyResult = {
  statusCode: 403,
  headers: commonHeaders,
  body: JSON.stringify({
    error: 'access_denied'
  })
}

export const INTERNAL_SERVER_ERROR_RESPONSE: APIGatewayProxyResult = {
  statusCode: 500,
  headers: commonHeaders,
  body: JSON.stringify({
    error: 'server_error',
    error_description: 'An internal server error occured'
  })
}
