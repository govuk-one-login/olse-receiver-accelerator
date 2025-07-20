import { sendVerificationSignal } from "./send-verification"
import { config } from "../config/config"


export function startVerificationSignals(): boolean {

    const intervalMs = config.VERIFICATION_INTERVAL * 60 * 1000
    try {

        setInterval(async () => {
            await sendVerificationSignal(config.RELYING_PARTY_URL, config.STREAM_ID)
        }, intervalMs)
        console.log('Verification signals scheduled sucessfully')
        return true;
    } catch (error) {
        console.error('Error scheduling verification signals:', error)
        return false;
    }
}
