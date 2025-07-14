import { handleSignalRouting } from './signal-route-handler'
import { SetPayload } from '../interfaces/interfaces'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'
import { CustomSetErrorCode } from '../enums/enums'

jest.mock('../utils/response-helper')
jest.mock('./signal-handlers')

const mockHandleAccountDisabled = handleAccountDisabled as jest.MockedFunction<
  typeof handleAccountDisabled
>
const mockHandleAccountPurged = handleAccountPurged as jest.MockedFunction<
  typeof handleAccountPurged
>

describe('handleSetRouting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should return success for valid account purged event', () => {
    const payload: SetPayload = {
      iss: 'https://gds.com',
      iat: 1622220,
      events: {
        'http://schemas.openid.net/secevent/risc/event/account_purged': {
          subject: {
            subject_type: 'account',
            account: { acct: 'user@gds.com' }
          }
        }
      }
    }

    const result = handleSignalRouting(payload)

    expect(result).toBe(undefined)
    expect(mockHandleAccountPurged).toHaveBeenCalledTimes(1)
    expect(mockHandleAccountDisabled).not.toHaveBeenCalled()
  })

  it('should return error when events are missing', () => {
    const payload: SetPayload = {
      iss: 'https://gds.com',
      iat: 1622222,
      events: {}
    }

    const result = handleSignalRouting(payload)

    expect(result).toEqual({
      success: false,
      errorCode: CustomSetErrorCode.MISSING_EVENTS,
      description: 'Missing events in Set Payload',
      statusCode: 400
    })
    expect(mockHandleAccountPurged).not.toHaveBeenCalled()
    expect(mockHandleAccountDisabled).not.toHaveBeenCalled()
  })

  it('should return error for unsupported event type', () => {
    const payload: SetPayload = {
      iss: 'https://gds.com',
      iat: 16222222,
      events: {
        'http://schemas.openid.net/secevent/risc/event/account_enabled': {
          subject: {
            subject_type: 'account',
            account: { acct: 'user@gds.com' }
          }
        }
      }
    }

    const result = handleSignalRouting(payload)

    expect(result).toEqual({
      success: false,
      errorCode: CustomSetErrorCode.UNSUPPORTED_EVENT_TYPE,
      description: 'Unsupported event type',
      statusCode: 400
    })
    expect(mockHandleAccountDisabled).not.toHaveBeenCalled()
    expect(mockHandleAccountPurged).not.toHaveBeenCalled()
  })

  it('should handle errors and return 500 status', () => {
    const payload: SetPayload = {
      iss: 'https://gds.com',
      iat: 16222222,
      events: {
        'http://schemas.openid.net/secevent/risc/event/account_purged': {
          subject: {
            subject_type: 'account',
            account: { acct: 'user@gds.com' }
          }
        }
      }
    }
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockHandleAccountPurged.mockImplementation(() => {
      throw new Error('error')
    })

    const result = handleSignalRouting(payload)

    expect(result).toEqual({
      success: false,
      errorCode: CustomSetErrorCode.FAILED_TO_PROCESS,
      description: 'Failed to process the request',
      statusCode: 500
    })
    expect(mockHandleAccountPurged).toHaveBeenCalledTimes(1)
    expect(mockHandleAccountDisabled).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error processing signal routing:',
      expect.any(Error)
    )
  })
})
