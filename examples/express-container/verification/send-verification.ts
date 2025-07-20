import { createVerificationJwt } from './verification-jwt.ts';

export async function sendVerificationSignal(
    relyingPartyUrl: string,
    streamId: string,
    options?: {
        state?: string;
        generateStatePayload?: boolean
    }
): Promise<boolean> {
    try {

        const verificationJwt = await createVerificationJwt(relyingPartyUrl, streamId, options);

        const response = await fetch(relyingPartyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/secevent+jwt',
                'Accept': 'application/json',
            },
            body: verificationJwt,
        });
        if (response.ok) {
            console.log('Verification signal sent successfully to : ', relyingPartyUrl);
            return true;
        } else {
            console.error('Failed to send verification signal:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error sending verification signal:', error);
        return false;
    }
};