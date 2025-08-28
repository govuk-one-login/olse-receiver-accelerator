import { Request } from 'express'
import { generateJWT } from './jwt'
import { getAuthInput } from './getAuthInput'
import { ConfigurationKeys } from '../config/ConfigurationKeys'

interface ValidResponse {
  valid: true
  data: {
    access_token: string
    token_type: 'Bearer'
    expires_in: number
  }
}

interface InvalidResponse {
  valid: false
  error: string
  response_code: number
}

type Result = ValidResponse | InvalidResponse
export const auth = async (req: Request): Promise<Result> => {
  const { client_id, client_secret, grant_type } = getAuthInput(req)
  if (grant_type !== 'client_credentials') {
    return { valid: false, error: 'invalid_grant', response_code: 400 }
  }

  if (
    client_id === process.env[ConfigurationKeys.CLIENT_ID] &&
    client_secret === process.env[ConfigurationKeys.CLIENT_SECRET]
  ) {
    try {
      const token = await generateJWT({
        alg: 'PS256',
        audience: 'https://transmitter.example.com',
        issuer: 'https://receiver.example.com',
        jti: '123456',
        useExpClaim: true,
        payload: {}
      })
      return {
        valid: true,
        data: { token_type: 'Bearer', access_token: token, expires_in: 3600 }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'invalid_request') {
          console.log(
            'Invalid request: The request is missing required parameters or is malformed'
          )
          return { valid: false, error: 'invalid_request', response_code: 400 }
        } else if (error.message === 'invalid_grant') {
          console.log(
            'Invalid grant: The provided authorisation grant is invalid or expired'
          )
          return { valid: false, error: 'invalid_grant', response_code: 400 }
        }
      }
      return { valid: false, error: 'invalid_request', response_code: 400 }
    }
  } else {
    console.log('Supplied client id or secret did not match expected values')
    return { valid: false, error: 'invalid_client', response_code: 401 }
  }
}
