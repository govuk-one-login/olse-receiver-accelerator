import { sendVerificationSignal } from "./send-verification"
import { config } from "../config/config"
import cron from 'node-cron';


export function startVerificationSignals(): boolean {

    if (!cron.validate(config.CRON_SCHEDULE)) {
        console.error(`Invalid cron schedule`)
        return false
    }

    try {
        cron.schedule(config.CRON_SCHEDULE, async () => {
            console.log('Sending scheduled verification signal');
            await sendVerificationSignal(config.RELYING_PARTY_URL, config.STREAM_ID)
        }, {
            timezone: "UTC"
        }
        )
        console.log('Verification signals scheduled successfully');
        return true;
    } catch (error) {
        console.error('Error scheduling verification signals:', error)
        return false;
    }
}
