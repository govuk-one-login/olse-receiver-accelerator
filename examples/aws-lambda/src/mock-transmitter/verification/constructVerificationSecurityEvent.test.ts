import { constructVerificationFullSecurityEvent } from './constructVerificationSecurityEvent'

describe('constructVerificationFullSecurityEvent', () => {
  it('creates SET', () => {
    const timeStamp = 10001
    const result = constructVerificationFullSecurityEvent(
      'test-request-id-001',
      timeStamp,
      { stream_id: 'test-stream-id-001', state: 'test-state-001' }
    )

    expect(result).toEqual({
      aud: 'https://gds.co.uk/rp/Events',
      events: {
        'https://schemas.openid.net/secevent/ssf/event-type/verification': {
          state: 'test-state-001'
        }
      },
      iat: Math.floor(timeStamp / 1000),
      iss: 'https://gds.co.uk/mock/verify',
      jti: 'test-request-id-001',
      sub_id: {
        format: 'opaque',
        id: 'test-stream-id-001'
      }
    })
  })
})
