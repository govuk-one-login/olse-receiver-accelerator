import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'
import { lambdaLogger as logger } from '../../../../../common/logging/logger'

const pause = (timeInMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Processing goodbye request', { event: event })
    const response = {
      message: 'goodbye',
      timestamp: Date.now()
    }

    // add a pause to prevent eslint from raising issues around the lack of an await function
    await pause(10)
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    }
  } catch (error) {
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
