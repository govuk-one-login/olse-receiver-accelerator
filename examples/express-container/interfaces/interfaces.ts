
export interface SetPayload {
  iss?: string
  aud?: string | string[]
  iat?: number
  jti?: string
  sub?: string
  events?: Record<string, object>
  txn?: string
  toe?: number
}

export interface VerificationPayload {
  iss: string,
  jti: string,
  aud: string
  iat: number,
  sub_id: {
    format: 'opaque'
    id: string
  }
  events: {
    'https://schemas.openid.net/secevent/ssf/event-type/verification': {
      state: string
    }
  }
}

export interface VerificationTxConfig {
  JWT_SECRET: string
  ISSUER: string
  PORT: number
  CRON_SCHEDULE: string
  RELYING_PARTY_URL: string
  STREAM_ID: string
}

export interface StatePayload {
  requested_at: number;
  // eslint-disable-next-line
  [key: string]: any;
}