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
import { getParameter } from '../../../../../common/ssm/ssm'
import { ConfigurationKeys } from '../../../../../common/config/configurationKeys'
import { getEnv } from '../utils'

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

    const signedJWT = await signedJWTWithKMS(verificationSET)
    console.log('Signed JWT:', signedJWT)

    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME)
    const receiverEndpoint = await getParameter(
      `/${stackName}/receiver-endpoint`
    )
    if (!process.env['RECEIVER_SECRET_ARN']) {
      throw new Error('RECEIVER_SECRET_ARN environment variable is not set')
    }
    const access_token = await getTokenFromCognito(
      process.env['RECEIVER_SECRET_ARN']
    )

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
