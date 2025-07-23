import { verifyStateJwt } from '../signalRouting/verifyState'
import { handleVerificationSignal } from './signalHandlers'
import { StatePayload } from '../interfaces/interfaces'

jest.mock('./verifyState')

const mockVerifyStateJwt = verifyStateJwt as jest.MockedFunction<
  typeof verifyStateJwt
>

const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation()
}

describe('handleVerificationSignal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns valid for verification signal without state', async () => {
    const jwtPayload = {
      sub_id: { format: 'opaque', id: 'steam-id-001' },
      events: {
        'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
      }
    }

    const result = await handleVerificationSignal(jwtPayload)

    expect(result).toEqual({ valid: true })
    expect(consoleSpy.log).toHaveBeenCalledWith(
      'Verification signal without state received'
    )
  })

  it('returns false for verification signal state exceeds max age', async () => {
    const currentTime = Math.floor(Date.now() / 1000)
    const mockStatePayload = {
      requested_at: currentTime - 100 * 60
    }
    mockVerifyStateJwt.mockResolvedValue(mockStatePayload as StatePayload)
    const jwtPayload = {
      sub_id: { format: 'opaque' },
      events: {
        'https://schemas.openid.net/secevent/ssf/event-type/verification': {
          state: 'header.payload.signature'
        }
      }
    }

    const result = await handleVerificationSignal(jwtPayload)

    expect(result).toEqual({ valid: false, errorMessage: 'invalid_state' })
  })
})
