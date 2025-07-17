export const verificationSignalWithState = {
  jti: '123456',
  iss: 'https://transmitter.example.com',
  aud: 'receiver.example.com',
  iat: 1493856000,
  sub_id: {
    format: 'opaque',
    id: 'f67e39a0a4d34d56b3aa1bc4cff0069f'
  },
  events: {
    'https://schemas.openid.net/secevent/ssf/event-type/verification': {
      state: 'VGhpcyBpcyBhbiBleGFtcGxlIHN0YXRlIHZhbHVlLgo='
    }
  }
}

export const verificationSignalWithoutState = {
  jti: '123456',
  iss: 'https://transmitter.example.com',
  aud: 'receiver.example.com',
  iat: 1493856000,
  sub_id: {
    format: 'opaque',
    id: 'f67e39a0a4d34d56b3aa1bc4cff0069f'
  },
  events: {
    'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
  }
}
