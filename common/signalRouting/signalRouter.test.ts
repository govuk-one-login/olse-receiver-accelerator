import { verificationSignalWithState } from '../../tests/testConstants'
import { SignalSchema } from '../constants'
import { handleSignalRouting } from './signalRouter'

describe('handleSetRouting', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should return success for valid verificationSignal', async () => {
    const result = await handleSignalRouting(
      verificationSignalWithState,
      SignalSchema.VERIFICATION_SIGNAL
    )
    expect(result.valid).toBe(true)
    // @ts-expect-error because of boolean types, the schema field is only usable if there is a boolean check
    expect(result.schema).toBe(SignalSchema.VERIFICATION_SIGNAL)
  })
})
