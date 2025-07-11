import { Response } from 'express'
import { handleSignalRouting } from './signal-route-handler'
import { SetRequest } from '../interfaces/interfaces'
import { sendSignalResponse } from '../utils/response-helper'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'
import { SetErrorCode } from '../enums/enums'

jest.mock('../utils/response-helper')
jest.mock('./signal-handlers')

const mockSendSignalResponse = sendSignalResponse as jest.MockedFunction<
  typeof sendSignalResponse
>
const mockHandleAccountDisabled = handleAccountDisabled as jest.MockedFunction<
  typeof handleAccountDisabled
>
const mockHandleAccountPurged = handleAccountPurged as jest.MockedFunction<
  typeof handleAccountPurged
>

describe('handleSetRouting', () => {
  let mockRes: Partial<Response>
  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })
  it('should return 200 for valid requests', () => {
    const req: Partial<SetRequest> = {
      body: {
        iss: 'https://example.com',
        iat: 1633072800,
        events: {
          'http://schemas.openid.net/secevent/risc/event/account_disabled': {
            subject: {
              subject_type: 'account',
              account: { acct: 'user@example.com' }
            }
          }
        }
      }
    }

    handleSignalRouting(req as SetRequest, mockRes as Response)

    expect(mockSendSignalResponse).toHaveBeenCalledWith(mockRes, true)
    expect(mockHandleAccountDisabled).toHaveBeenCalledTimes(1)
    expect(mockHandleAccountPurged).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid requests', () => {
    const req: Partial<SetRequest> = {
      body: {
        iss: 'https://example.com',
        iat: 1633072800,
        events: {
          'http://schemas.openid.net/secevent/risc/event/account_enabled': {
            subject: {
              subject_type: 'account',
              account: { acct: 'user@example.com' }
            }
          }
        }
      }
    }
    const res = {} as Response

    handleSignalRouting(req as SetRequest, res)

    expect(mockSendSignalResponse).toHaveBeenCalledWith(
      res,
      false,
      SetErrorCode.UNSUPPORTED_EVENT_TYPE,
      'Unsupported event type'
    )
    expect(mockHandleAccountDisabled).not.toHaveBeenCalled()
    expect(mockHandleAccountPurged).not.toHaveBeenCalled()
  })
})
