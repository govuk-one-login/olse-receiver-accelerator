import { handleVerificationSignal } from './signalHandlers'

jest.mock('./verifyState')

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
})
