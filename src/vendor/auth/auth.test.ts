import { Request } from 'express'
import { auth } from './auth'
import { generateJWT } from './jwt'
import { getAuthInput } from './getAuthInput'
import { ConfigurationKeys } from '../config/ConfigurationKeys'
import { config } from '../../../examples/express-container/config/globalConfig'
import { logger } from '../../../common/logger'

const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation()
jest.mock('./jwt')
jest.mock('./getAuthInput')

const mockGenerateJWT = generateJWT as jest.MockedFunction<typeof generateJWT>
const mockGetAuthInput = getAuthInput as jest.MockedFunction<
  typeof getAuthInput
>

describe('auth', () => {
  let mockReq: Partial<Request> // to fix

  beforeEach(async () => {
    mockReq = {}
    process.env[ConfigurationKeys.CLIENT_ID] = 'test_client_id'
    process.env[ConfigurationKeys.CLIENT_SECRET] = 'test_client_secret'
    await config.initialise()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('handle invalid_request error and log correct message', async () => {
    mockGetAuthInput.mockReturnValue({
      client_id: 'test_client_id',
      client_secret: 'test_client_secret',
      grant_type: 'client_credentials'
    })
    mockGenerateJWT.mockRejectedValue(new Error('invalid_request'))
    const result = await auth(mockReq as Request)

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      'Invalid request: The request is missing required parameters or is malformed'
    )
    expect(result).toEqual({
      valid: false,
      error: 'invalid_request',
      response_code: 400
    })
  })

  test('handle invalid_grant error and log correct message', async () => {
    mockGetAuthInput.mockReturnValue({
      client_id: 'test_client_id',
      client_secret: 'test_client_secret',
      grant_type: 'client_credentials'
    })
    mockGenerateJWT.mockRejectedValue(new Error('invalid_grant'))

    const result = await auth(mockReq as Request)

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      'Invalid grant: The provided authorisation grant is invalid or expired'
    )
    expect(result).toEqual({
      valid: false,
      error: 'invalid_grant',
      response_code: 400
    })
  })

  test('return invalid_client for wrong credentials', async () => {
    mockGetAuthInput.mockReturnValue({
      client_id: 'wrong_id',
      client_secret: 'wrong_secret',
      grant_type: 'client_credentials'
    })

    const result = await auth(mockReq as Request)

    expect(result).toEqual({
      valid: false,
      error: 'invalid_client',
      response_code: 401
    })
  })
})
