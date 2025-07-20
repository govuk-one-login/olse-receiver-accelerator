import { getPublicKeyFromJWK } from "../../../src/vendor/getPublicKey"
import { validateJWT } from "../../../src/vendor/jwt/validateJWT"
import { verifyStateJwt } from "./verify-state";
import { readFileSync } from 'fs';


jest.mock('../../../src/vendor/jwt/validateJWT');
jest.mock('../../../src/vendor/getPublicKey')

jest.mock('fs')

const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
describe('verifyStateJwt', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env["JWT_ISSUER"] = 'test-issuer';
        mockReadFileSync.mockReturnValue('{"someKey":"someKeyValue"}');
        // eslint-disable-next-line
        (getPublicKeyFromJWK as jest.MockedFunction<typeof getPublicKeyFromJWK>).mockResolvedValue('mock-public-key' as any);
    })

    it('verifies valid JWT and return payload', async () => {

        const mockPayload = {
            requested_at: Math.floor(Date.now() / 1000)
        };

        // eslint-disable-next-line
        (validateJWT as jest.MockedFunction<typeof validateJWT>).mockResolvedValue({ payload: mockPayload } as any)

        const result = await verifyStateJwt('header.payload.signature')

        expect(result).toEqual(mockPayload)
    })

    it('returns null for invalid JWT', async () => {
        (validateJWT as jest.MockedFunction<typeof validateJWT>).mockRejectedValue(new Error('Error'))

        const result = await verifyStateJwt('header.payload.signature')

        expect(result).toBeNull();
    })
})