interface RequestBody {
  stream_id: string
  state?: string
}
function isValidStreamId(streamId: string): boolean {
  return (
    typeof streamId === 'string' &&
    streamId.length >= 1 &&
    streamId.length <= 256 &&
    /^[a-zA-Z0-9_-]+$/.test(streamId)
  )
}

function isValidState(state: string): boolean {
  return typeof state === 'string' && state.length <= 1024
}

export function isValidationError(errorMessage: string): boolean {
  const validationErrors = [
    'MISSING_BODY',
    'INVALID_JSON',
    'MISSING_STREAM_ID',
    'INVALID_STATE'
  ]
  return validationErrors.includes(errorMessage)
}
export function validateBody(body: string | null): RequestBody {
  if (!body) {
    throw new Error('MISSING_BODY')
  }

  let requestBody: RequestBody

  try {
    requestBody = JSON.parse(body) as RequestBody
  } catch {
    throw new Error('INVALID_JSON')
  }

  if (!requestBody.stream_id) {
    throw new Error('MISSING_STREAM_ID')
  }

  if (!isValidStreamId(requestBody.stream_id)) {
    throw new Error('INVALID_STREAM_ID')
  }

  if (requestBody.state != undefined && !isValidState(requestBody.state)) {
    throw new Error('INVALID_STATE')
  }

  return requestBody
}
