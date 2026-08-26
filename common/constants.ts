const SignalSchema = {
  VERIFICATION_SIGNAL: "./schemas/verificationEvent.json",
};

const httpErrorResponseMessages = {
  invalid_key: {
    description:
      "One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.).",
    err: "invalid_key",
  },
  invalid_request: {
    description:
      "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition.",
    err: "invalid_request",
  },
};

export { SignalSchema, httpErrorResponseMessages };
