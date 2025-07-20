import { VerificationTxConfig } from "../interfaces/interfaces";

export const config: VerificationTxConfig = {
    JWT_SECRET: process.env["JWT_SECRET"] ?? 'default',
    CRON_SCHEDULE: process.env["CRON_SCHEDULE"] ?? '*/15 * * * *',
    ISSUER: process.env["ISSUER"] ?? 'https://gds.com',
    RELYING_PARTY_URL: process.env["RELYING_PARTY_URL"] ?? 'relying_party_url',
}


