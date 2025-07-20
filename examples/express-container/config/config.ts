import { VerificationTxConfig } from "../interfaces/interfaces";

export const config: VerificationTxConfig = {
    JWT_SECRET: process.env["JWT_SECRET"] ?? 'default',
    VERIFICATION_INTERVAL: 60,
    ISSUER: process.env["ISSUER"] ?? 'https://gds.com',
    RELYING_PARTY_URL: process.env["RELYING_PARTY_URL"] ?? 'relying_party_url',
    STREAM_ID: process.env["STREAM_ID"] ?? 'no stream id'
}


