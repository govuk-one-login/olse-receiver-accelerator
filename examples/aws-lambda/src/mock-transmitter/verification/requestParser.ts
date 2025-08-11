import { APIGatewayProxyEvent } from 'aws-lambda'
import { SETVerificationRequest } from '../types'
import { validateBody } from './validation'

export function getVerificationRequest(
  event: APIGatewayProxyEvent
): SETVerificationRequest {
  const requestBody = validateBody(event.body)

  return {
    stream_id: requestBody.stream_id,
    state: requestBody.state
  }
}
