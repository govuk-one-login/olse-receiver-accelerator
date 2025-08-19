import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'
import { sendVerificationSignal } from '../../../../express-container/verification/sendVerification'
import { config } from '../../../../express-container/config/globalConfig'
import { ConfigurationKeys } from '../../../../express-container/config/ConfigurationKeys'
import { logger } from '../../../../../common/logging/logger'

const pause = (timeInMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

const VERIFICATION_ENDPOINT_URL = config.getOrDefault(
  ConfigurationKeys.VERIFICATION_ENDPOINT_URL,
  'https://rp.co.uk/verify'
)
const STREAM_ID = config.getOrDefault(
  ConfigurationKeys.STREAM_ID,
  'default-stream-id'
)

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Processing verification request', { event })

    // add a pause to prevent eslint from raising issues around the lack of an await function
    await pause(10)

    logger.debug('Sending verification signal')
    const response = await sendVerificationSignal(
      VERIFICATION_ENDPOINT_URL,
      STREAM_ID
    )
    logger.info('Verification sginal sent successfully', { response })
    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    }
  } catch (error) {
    // Handle any errors
    logger.error('Error processing request:', {
      error: error instanceof Error ? error.message : String(error)
    })
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error'
      })
    }
  }
}
