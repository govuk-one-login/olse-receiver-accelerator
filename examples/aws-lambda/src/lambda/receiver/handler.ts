import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'

const pause = (timeInMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Got this far")
    console.log(event)
    // Process the request
    const response = {
      message: 'hello',
      timestamp: Date.now()
    }

    // add a pause to prevent eslint from raising issues around the lack of an await function
    await pause(10)
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
