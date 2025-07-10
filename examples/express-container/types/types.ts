import { Request } from 'express';

export interface SetPayload {
    iss: string;
    aud: string | string[];
    iat: number;
    jti: string;
    sub?: string;
    events: Record<string, any>;
    txn?: string;
    toe?: number;
}

export interface SetRequest extends Request {
    body: SetPayload;
}

export interface SetErrorResponse {
    error: string;
    description: string;
}

export type SetHandler = (setPayload: SetPayload,
    eventData: string,
    req: SetRequest,
    res: Response,
) => Promise<void>;

export enum SetErrorCode {
    INVALID_REQUEST = 'invalid_request',
    INVALID_KEY = 'invalid_key',
    INVALID_ISSUER = 'invalid_issuer',
    INVALID_AUDIENCE = 'invalid_audience',
    AUTHENTICATION_FAILED = 'authentication_failed',
    ACCESS_DENIED = 'access_denied',
}

export enum RiscEventType {
    ACCOUNT_PURGED = 'http://schemas.openid.net/secevent/risc/event/account_purged',
    ACCOUNT_DISABLED = 'http://schemas.openid.net/risc/event/account_disabled',
    ACCOUNT_ENABLED = 'http://schemas.openid.net/risc/event/account_enabled',
    SESSIONS_REVOKED = 'http://schemas.openid.net/risc/event/sessions_revoked',
}