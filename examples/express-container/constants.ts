export const SignalSchema = {
  VERIFICATION_SIGNAL: './schemas/verificationEvent.json'
}

export const httpErrorResponseMessages = {
  invalid_key: {
    err: 'invalid_key',
    description:
      'One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.).'
  },
  invalid_request: {
    err: 'invalid_request',
    description:
      "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
  }
}
