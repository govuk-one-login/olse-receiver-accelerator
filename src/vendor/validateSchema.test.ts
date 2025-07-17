import {
  verificationSignalWithoutState,
  verificationSignalWithState
} from '../../tests/testConstants'
import { validateSignalAgainstSchemas } from './validateSchema'

describe('validateSignalAgainstSchema', () => {
  test('it should return valid: true if signal does match one of the given schema', async () => {
    expect(
      await validateSignalAgainstSchemas(verificationSignalWithState)
    ).toStrictEqual({
      valid: true,
      schema: './schemas/verificationEvent.json'
    })
  })

  test('it should return valid: true if signal does match one of the given schema without an optional field', async () => {
    expect(
      await validateSignalAgainstSchemas(verificationSignalWithoutState)
    ).toStrictEqual({
      valid: true,
      schema: './schemas/verificationEvent.json'
    })
  })

  test('it should return valid: false if signal does not match one of the given schema', async () => {
    const signalSet = {
      description: 'description',
      iss: 2
    }
    const validatedSignal = await validateSignalAgainstSchemas(signalSet)
    expect(validatedSignal.valid).toStrictEqual(false)
  })

  const invalidTestCases: {
    description: string
    input: Record<string, unknown>
    expectedValid: boolean
  }[] = [
    {
      description: 'missing required jti field',
      input: {
        iss: 'https://transmitter.example.com',
        aud: 'receiver.example.com',
        iat: 1493856000,
        sub_id: { format: 'opaque', id: 'f67e39a0a4d34d56b3aa1bc4cff0069f' },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
        }
      },
      expectedValid: false
    },
    {
      description: 'invalid iss type (number instead of string)',
      input: {
        jti: '123456',
        iss: 12345,
        aud: 'receiver.example.com',
        iat: 1493856000,
        sub_id: { format: 'opaque', id: 'f67e39a0a4d34d56b3aa1bc4cff0069f' },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
        }
      },
      expectedValid: false
    },
    {
      description: 'invalid iat type',
      input: {
        jti: '123456',
        iss: 'https://transmitter.example.com',
        aud: 'receiver.example.com',
        iat: '1493856000',
        sub_id: { format: 'opaque', id: 'f67e39a0a4d34d56b3aa1bc4cff0069f' },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
        }
      },
      expectedValid: false
    },
    {
      description: 'missing sub_id.format field',
      input: {
        jti: '123456',
        iss: 'https://transmitter.example.com',
        aud: 'receiver.example.com',
        iat: 1493856000,
        sub_id: { id: 'f67e39a0a4d34d56b3aa1bc4cff0069f' },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
        }
      },
      expectedValid: false
    },
    {
      description: 'empty events object',
      input: {
        jti: '123456',
        iss: 'https://transmitter.example.com',
        aud: 'receiver.example.com',
        iat: 1493856000,
        sub_id: { format: 'opaque', id: 'f67e39a0a4d34d56b3aa1bc4cff0069f' },
        events: {}
      },
      expectedValid: false
    },
    {
      description: 'additional unexpected field',
      input: {
        jti: '123456',
        iss: 'https://transmitter.example.com',
        aud: 'receiver.example.com',
        iat: 1493856000,
        sub_id: { format: 'opaque', id: 'f67e39a0a4d34d56b3aa1bc4cff0069f' },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
        },
        unexpectedField: 'should not be here'
      },
      expectedValid: false
    }
  ]

  it.each(invalidTestCases)(
    '$description',
    async ({ input, expectedValid }) => {
      const result = await validateSignalAgainstSchemas(input)
      expect(result.valid).toBe(expectedValid)
    }
  )
})
