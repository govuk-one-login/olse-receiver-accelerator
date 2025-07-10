import { Response } from 'express';
import { SetRequest as signalRequest, SetErrorCode } from '../types/types';
import { sendSignalResponse as sendSignalResponse } from '../utils/response-helper';
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers';

export function handleSignalRouting(req: signalRequest, res: Response): Response {
    const signalPayload = req.body;
    if (!signalPayload.events || !Array.isArray(signalPayload.events)) {
        return sendSignalResponse(res, false, SetErrorCode.INVALID_REQUEST, 'Invalid payload structure');
    }

    try {
        for (const event of signalPayload.events) {
            switch (event.type) {
                case 'http://schemas.openid.net/secevent/risc/event/account_purged':
                    handleAccountPurged(signalPayload, event.data, req, res);
                    break;
                case 'http://schemas.openid.net/secevent/risc/event/account_disabled':
                    handleAccountDisabled(signalPayload, event.data, req, res);
                    break;
                // Add or remove cases to be routed
                default:
                    return sendSignalResponse(res, false, SetErrorCode.INVALID_REQUEST, 'Unsupported event type');
            }
        }
        return sendSignalResponse(res, true);
    } catch (error) {
        return sendSignalResponse(res, false, SetErrorCode.AUTHENTICATION_FAILED, 'Failed to process the request');
    }
}