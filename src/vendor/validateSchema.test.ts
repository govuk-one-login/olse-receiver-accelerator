import { validateSignalAgainstSchema } from './validateSchema'

describe('validateSignalAgainstSchema', () => {
  test('it should return false if signal does not match any given schema', () => {
    const signalSet = 'not a valid signal'
    expect(validateSignalAgainstSchema(signalSet)).toBe(false)
  })

  test('it should return true if signal does match any given schema', () => {
    const signalSet = {
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
    expect(validateSignalAgainstSchema(signalSet)).toBe(true)
  })
})
