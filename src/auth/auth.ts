import { Request, Response } from 'express'
import { generateJWT } from './jwt'
import { getClientCredentials } from '../../examples/express-container/express'

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
}

type Result = ValidResponse | InvalidResponse
const auth = async (req: Request, res: Response): Promise<Result> => {
  const { client_id, client_secret } = getClientCredentials(req)

  if (
    client_id === process.env['CLIENT_ID'] &&
    client_secret === process.env['CLIENT_SECRET']
  ) {
    try {
      const token = await generateJWT()
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
          return { valid: false, error: 'invalid_request' }
        } else if (error.message === 'invalid_grant') {
          console.log(
            'Invalid grant: The provided authorisation grant is invalid or expired'
          )
          return { valid: false, error: 'invalid_grant' }
        }
      }
      return { valid: false, error: 'invalid_request' }
    }
  } else {
    return { valid: false, error: 'invalid_client' }
  }
}

export { auth }
