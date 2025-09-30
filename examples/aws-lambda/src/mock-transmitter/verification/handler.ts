import { lambdaLogger as logger } from '../../../../../common/logging/logger'
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
import { getTokenFromCognito } from '../../../../../common/cognito/getTokenFromCognito'
import { getParameter } from '../../../../../common/ssm/ssm'
import { ConfigurationKeys } from '../../../../../common/config/configurationKeys'
import { getEnv } from '../utils'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Received verification request:', { event })
    const verificationRequest: SETVerificationRequest =
      getVerificationRequest(event)
    logger.debug('Parsed verification request:', { verificationRequest })
    const verificationSET = constructVerificationFullSecurityEvent(
      event.requestContext.requestId,
      Date.now(),
      verificationRequest
    )

    const signedJWT = await signedJWTWithKMS(verificationSET)
    logger.debug('Signed JWT:', { signedJWT })

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
    logger.info('Receiver response status:', { status: response.status })

    if (response.status === 202) {
      logger.info('Verification SET delivered successfully', {
        receiverEndpoint
      })
    } else {
      logger.error('SET failed to delivery', {
        status: response.status,
        statusText: response.statusText
      })
    }

    return NO_CONTENT_RESPONSE
  } catch (error) {
    logger.error('Error processing verification request:', {
      error: error instanceof Error ? error.message : String(error)
    })
    if (error instanceof Error && isValidationError(error.message)) {
      return INVALID_REQUEST_RESPONSE
    }

    return INTERNAL_SERVER_ERROR_RESPONSE
  }
}
