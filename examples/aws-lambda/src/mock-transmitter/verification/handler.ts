import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getVerificationRequest } from './requestParser'
import { constructVerificationFullSecurityEvent } from './constructVerificationSecurityEvent'
import { signedJWTWithKMS } from '../kmsService'
import {
  INTERNAL_SERVER_ERROR_RESPONSE,
  INVALID_REQUEST_RESPONSE,
  NO_CONTENT_RESPONSE
} from '../responses'
import { isValidationError } from './validation'
import { SETVerificationRequest } from '../mockApiTxInterfaces'
import { getTokenFromCognito } from '../../../../../tests/vendor/helpers/getTokenFromCognito'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received verification request:', event)
    const verificationRequest: SETVerificationRequest =
      getVerificationRequest(event)
    console.log('Parsed verification request:', verificationRequest)
    const verificationSET = constructVerificationFullSecurityEvent(
      event.requestContext.requestId,
      Date.now(),
      verificationRequest
    )
    console.log('Constructed verification SET:', verificationSET)

    const signedJWT = await signedJWTWithKMS(verificationSET)
    console.log('Signed JWT:', signedJWT)

    const receiverEndpoint =
      process.env['RECEIVER_ENDPOINT1'] ??
      'https://uiaxaw17k2.execute-api.eu-west-2.amazonaws.com/dev/api/v1/Events'

    const access_token = await getTokenFromCognito(
      process.env['RECEIVER_SECRET_ARN']
    )

    console.log('Using receiver endpoint:', receiverEndpoint)

    console.log('sending to receiver endpoint', receiverEndpoint)

    /// I NEED TO ADD add auth header

    //If not check if the lambda is able to send back out to the net. Because the api gateway its hitting is within its own stack does it need an integration like receiver gateway and lambda so between api gateway and mock tx api tx etc
    const response = await fetch(receiverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: signedJWT
    })
    console.log('Receiver response status:', response.status)

    if (response.status === 202) {
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
