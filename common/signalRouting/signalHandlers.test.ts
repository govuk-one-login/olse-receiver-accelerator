import { handleVerificationSignal } from './signalHandlers'
import { baseLogger as logger } from '../../common/logging/logger'

vi.mock('./verifyState')

const loggerInfoSpy = vi.spyOn(logger, 'info')

describe('handleVerificationSignal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      'Verification signal without state received'
    )
  })
})
