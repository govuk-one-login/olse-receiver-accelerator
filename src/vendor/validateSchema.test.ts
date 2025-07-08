import { validateSignalAgainstSchemas } from './validateSchema'

describe('validateSignalAgainstSchema', () => {
  test('it should return valid: true if signal does match one of the given schema', async () => {
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
    expect(await validateSignalAgainstSchemas(signalSet)).toStrictEqual({
      valid: true,
      schema: '../../examples/express-container/schemas/verificationEvent.json'
    })
  })

  test('it should return valid: true if signal does match one of the given schema without an optional field', async () => {
    const signalSet = {
      jti: '123456',
      iss: 'https://transmitter.example.com',
      aud: 'receiver.example.com',
      iat: 1493856000,
      sub_id: {
        format: 'opaque',
        id: 'f67e39a0a4d34d56b3aa1bc4cff0069f'
      }
    }
    expect(await validateSignalAgainstSchemas(signalSet)).toStrictEqual({
      valid: true,
      schema: '../../examples/express-container/schemas/verificationEvent.json'
    })
  })

  test('it should return valid: false if signal does not match one of the given schema', async () => {
    const signalSet = {
      description: 'description',
      iss: 2
    }
    expect(await validateSignalAgainstSchemas(signalSet)).toStrictEqual({
      valid: false
    })
  })
})
