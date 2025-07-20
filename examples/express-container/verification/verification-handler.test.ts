import { verifyStateJwt } from "./verify-state";
import { handleVerificationEvent } from "./verification-handler";
import { StatePayload, VerificationPayload } from "../interfaces/interfaces";


jest.mock('./verify-state')

const mockVerifyStateJwt = verifyStateJwt as jest.MockedFunction<typeof verifyStateJwt>;

const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation()
}

describe('handleVerificationEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('returns valid for verification event without state', async () => {
        const jwtPayload = {
            sub_id: { format: 'opaque', id: 'steam-id-001' },
            events: {
                'https://schemas.openid.net/secevent/ssf/event-type/verification': {}
            }
        };

        const result = await handleVerificationEvent(jwtPayload as unknown as VerificationPayload);

        expect(result).toEqual({ valid: true });
        expect(consoleSpy.log).toHaveBeenCalledWith('Verification event without state received');
    })

    it('returns false for verification event state exceeds max age', async () => {
        const currentTime = Math.floor(Date.now() / 1000);
        const mockStatePayload = {
            requested_at: currentTime - (100 * 60)
        };
        mockVerifyStateJwt.mockResolvedValue(mockStatePayload as StatePayload)
        const jwtPayload = {
            sub_id: { format: 'opaque' },
            events: {
                'https://schemas.openid.net/secevent/ssf/event-type/verification': {
                    state: 'header.payload.signature'
                }
            }
        };

        const result = await handleVerificationEvent(jwtPayload as unknown as VerificationPayload);

        expect(result).toEqual({ valid: false, error: 'invalid_state' });
    })

})