import { Response } from 'express';
import { handleSignalRouting } from './signal-route-handler';
import { SetRequest, SetErrorCode } from '../types/types';

describe('handleSetRouting', () => {
    it('should return 200 for valid requests', () => {
        const req = {
            body: {
                events: [
                    {
                        type: 'http://schemas.openid.net/secevent/risc/event/account_purged',
                        data: {}
                    }
                ]
            }
        } as unknown as SetRequest;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const result = handleSignalRouting(req, res);

        expect(result.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 400 for invalid requests', () => {
        const req = {
            body: {
                events: [
                    {
                        type: 'http://schemas.openid.net/secevent/risc/event/account_enabled',
                        data: {}
                    }
                ]
            }
        } as unknown as SetRequest;
        const res = {} as Response
        res.json = jest.fn();
        res.status = jest.fn().mockReturnThis();
        res.set = jest.fn().mockReturnThis();

        handleSignalRouting(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ err: SetErrorCode.INVALID_REQUEST, description: 'Unsupported event type' });
    });
});