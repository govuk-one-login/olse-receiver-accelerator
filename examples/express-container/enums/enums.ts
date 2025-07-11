export enum RiscEventType {
  ACCOUNT_PURGED = 'http://schemas.openid.net/secevent/risc/event/account_purged',
  ACCOUNT_DISABLED = 'http://schemas.openid.net/secevent/risc/event/account_disabled'
}

export enum SetErrorCode {
  MISSING_EVENTS = 'missing_events',
  INVALID_REQUEST = 'invalid_request',
  INVALID_KEY = 'invalid_key',
  INVALID_ISSUER = 'invalid_issuer',
  INVALID_AUDIENCE = 'invalid_audience',
  AUTHENTICATION_FAILED = 'authentication_failed',
  ACCESS_DENIED = 'access_denied',
  FAILED_TO_PROCESS = 'failed_to_process',
  UNSUPPORTED_EVENT_TYPE = 'unsupported_event_type'
}
