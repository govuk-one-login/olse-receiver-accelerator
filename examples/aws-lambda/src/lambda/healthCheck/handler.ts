import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'
import { sendVerificationSignal } from '../../../../express-container/verification/sendVerification'
import { config } from '../../../../express-container/config/globalConfig'
import { ConfigurationKeys } from '../../../../express-container/config/ConfigurationKeys'
import { getParameter } from '../../../../../common/ssm/ssm'
import { getEnv } from '../../mock-transmitter/utils'

const pause = (timeInMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

const STREAM_ID = config.getOrDefault(
  ConfigurationKeys.STREAM_ID,
  'default-stream-id'
)

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event)
    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME)
    const verificationEndpointUrl = await getParameter(
      `/${stackName}/receiver-endpoint`
    )
    console.log('Verification endpoint url', verificationEndpointUrl)

    // add a pause to prevent eslint from raising issues around the lack of an await function
    await pause(10)

    const response = await sendVerificationSignal(
      verificationEndpointUrl,
      STREAM_ID
    )
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
