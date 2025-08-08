import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getVerificationRequest } from './requestParser'
import { constructVerificationFullSecurityEvent } from './constructVerificationSecurityEvent'
import { signedJWTWithKMS } from './kmsService'
import {
  INTERNAL_SERVER_ERROR_RESPONSE,
  INVALID_REQUEST_RESPONSE,
  NO_CONTENT_RESPONSE
} from './responses'
import { isValidationError } from './validation'
import { SETVerificationRequest } from './types'

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const verificationRequest: SETVerificationRequest =
      getVerificationRequest(event)

    const verificationSET = constructVerificationFullSecurityEvent(
      event.requestContext.requestId,
      Date.now(),
      verificationRequest
    )

    const signedJWT = await signedJWTWithKMS(verificationSET)

    const receiverEndpoint =
      process.env['RECEIVER_ENDPOINT'] ?? 'https://rp.co.uk/Events'

    const response = await fetch(receiverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json'
      },
      body: signedJWT
    })

    if (response.ok) {
      console.log(
        `Verification SET delivered successfully to ${receiverEndpoint}`
      )
    } else {
      console.error(
        `SET failed to delivery: ${String(response.status)} ${response.statusText}`
      )
    }

    return NO_CONTENT_RESPONSE
  } catch (error) {
    console.error('Error processing verification request:', error)
    if (error instanceof Error && isValidationError(error.message)) {
      return INVALID_REQUEST_RESPONSE
    }

    return INTERNAL_SERVER_ERROR_RESPONSE
  }
}
