import cron from 'node-cron'
import { startVerificationSignals } from './scheduler'
import { sendVerificationSignal } from './send-verification'

jest.mock('node-cron');
jest.mock('./send-verification')


jest.mock('../config/config', () => ({
    config: {
        CRON_SCHEDULE: '*/15 * * * *',
        RELYING_PARTY_URL: 'https://rp.co.uk/verification',
        STREAM_ID: 'default-stream-id-01'
    }
}));

const consoleLogSpy = jest.spyOn(console, 'log');
const consoleErrorSpy = jest.spyOn(console, 'error')


describe('startVerificationSignals', () => {
    const mockCronValidate = jest.mocked(cron.validate);
    const mockCronSchedule = jest.mocked(cron.schedule);
    const mockSendVerificationSignal = (sendVerificationSignal as unknown as jest.Mock)

    beforeEach(() => {
        jest.clearAllMocks()

        mockCronValidate.mockReturnValue(true)
        mockSendVerificationSignal.mockReturnValue(true)


    })

    it('returns true when scheduling succeeds', () => {
        const result = startVerificationSignals()

        expect(result).toBe(true);
        expect(consoleLogSpy).toHaveBeenCalledWith('Verification signals scheduled successfully')
    })

    it('returns false when cron schedule is invalid', () => {
        mockCronValidate.mockReturnValue(false)

        const result = startVerificationSignals()

        expect(result).toBe(false)
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid cron schedule')
    })

    it('should return false when cron schedule throws an error', () => {
        const cronError = new Error('error')
        mockCronSchedule.mockImplementation(() => {
            throw cronError
        })

        const result = startVerificationSignals();


        expect(result).toBe(false)
    })
})