import { VerificationPayload } from "../interfaces/interfaces";
import { verifyStateJwt } from "./verify-state";

export async function handleVerificationEvent(jwtPayload: VerificationPayload): Promise<{ valid: boolean; error?: string }> {

    const verificationEvent = jwtPayload.events?.['https://schemas.openid.net/secevent/ssf/event-type/verification'];

    if (!verificationEvent) {
        return { valid: true };
    }

    const state = verificationEvent.state;

    if (!state) {
        console.log('Verification event received');
        return { valid: true };
    }

    if (typeof state === 'string' && state.split('.').length === 3) {
        console.log('Verification event with state recieved');

        const statePayload = await verifyStateJwt(state)

        if (!statePayload) {
            console.error('Invalid or expired state JWT')
            return { valid: false, error: 'invalid_state' }
        }

        const maxAge = 15 * 60;
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - statePayload.requested_at > maxAge) {
            return { valid: false, error: 'invalid_state' };
        }

    }
    console.log('Verification event with state payload validated successfully');

    return { valid: true };

}