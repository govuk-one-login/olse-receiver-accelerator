import { handleSignalRouting } from './signal-route-handler'
import { SetPayload } from '../interfaces/interfaces'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'
import { SetErrorCode } from '../enums/enums'

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
      errorCode: SetErrorCode.UNSUPPORTED_EVENT_TYPE,
      description: 'Unsupported event type'
    })
    expect(mockHandleAccountDisabled).not.toHaveBeenCalled()
    expect(mockHandleAccountPurged).not.toHaveBeenCalled()
  })
})
