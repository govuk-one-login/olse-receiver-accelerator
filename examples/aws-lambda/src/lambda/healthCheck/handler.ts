import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'
import { ConfigurationKeys } from '../../../../express-container/config/ConfigurationKeys'
import { getParameter } from '../../../../../common/ssm/ssm'
import { getEnv } from '../../mock-transmitter/utils'
import { getTokenFromCognito } from '../../../../../tests/vendor/helpers/getTokenFromCognito'
import { createVerificationRequestJWT } from '../../createVerificationRequestJwt/createVerificationRequestJwt'
import { lambdaLogger as logger } from '../../../../../common/logging/logger'

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Processing verification request', { event })

    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME)
    const verificationEndpointUrl = await getParameter(
      `/${stackName}/mock-verification-endpoint`
    )
    logger.debug('Verification endpoint url resolved', {
      verificationEndpointUrl
    })

    const mockTxSecretArn = getEnv('MOCK_TX_SECRET_ARN')
    const access_token = await getTokenFromCognito(mockTxSecretArn)

    const verificationRequestJWT = await createVerificationRequestJWT(
      'health-check-stream',
      'health-check-state'
    )

    logger.debug('Sending verification signal')
    const response = await fetch(verificationEndpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: verificationRequestJWT
    })
    logger.info('Verification signal sent', {
      status: response.status,
      ok: response.ok
    })

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          status: response.status,
          message: 'Health check failed'
        })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        status: response.status,
        message: 'Health check passed'
      })
    }
  } catch (error) {
    logger.error('Error processing request:', {
      error: error instanceof Error ? error.message : String(error)
    })
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        status: 500,
        message: 'Health check failed'
      })
    }
  }
}
