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

const pause = (timeInMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event)
    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME)
    console.log(getParameter)
    const verificationEndpointUrl = await getParameter(
      `/${stackName}/mock-verification-endpoint`
    )
    console.log('Verification endpoint url', verificationEndpointUrl)

    const mockTxSecretArn = getEnv('MOCK_TX_SECRET_ARN')
    const access_token = await getTokenFromCognito(mockTxSecretArn)

    // add a pause to prevent eslint from raising issues around the lack of an await function
    await pause(10)

    const verificationRequestJWT = await createVerificationRequestJWT(
      'health-check-stream',
      'health-check-state'
    )

    const response = await fetch(verificationEndpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: verificationRequestJWT
    })
    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    }
  } catch (error) {
    // Handle any errors
    console.error('Error processing request:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error'
      })
    }
  }
}
