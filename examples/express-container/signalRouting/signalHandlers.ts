interface validResponse {
  valid: true
}

interface invalidResponse {
  valid: false
  errorMessage: string
}

export function handleVerificationSignal(
  _setPayload: Record<string, unknown>
): validResponse | invalidResponse {
  return {
    valid: true
  }
}
