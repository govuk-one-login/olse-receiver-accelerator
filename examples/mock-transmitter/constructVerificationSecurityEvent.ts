import { SET, SETVerificationRequest } from './types'

export function constructVerificationFullSecurityEvent(
  requestId: string,
  timeStamp: number,
  verificationReqeuest: SETVerificationRequest
): SET {
  const set: SET = {
    iss: process.env['ISSUER'] ?? 'https://gds.co.uk/mock/verify',
    aud: process.env['AUDIENCE'] ?? 'https://gds.co.uk/rp/Events',
    iat: Math.floor(timeStamp / 1000),
    jti: requestId,
    events: {
      'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
    },
    sub_id: {
      format: 'opaque',
      id: verificationReqeuest.stream_id
    }
  }

  if (verificationReqeuest.state) {
    addStateToVerificationEvent(set, verificationReqeuest.state)
  }

  return set
}

function addStateToVerificationEvent(set: SET, state: string): void {
  const verificationEvent =
    set.events[
      'https://schemas.openid.net/secevent/ssf/event-type/verification'
    ]
  if (verificationEvent) {
    verificationEvent.state = state
  }
}
