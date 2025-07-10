import { SetErrorCode } from "../types/types";
import { sendSignalResponse } from "./response-helper";
import { Response } from "express";

describe("sendSignalResponse", () => {
    it("should send a 200 response for successful requests", () => {
        const res: Response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        } as any;
        sendSignalResponse(res as Response, true);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should send a 400 response for failed requests", () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        } as any;

        sendSignalResponse(res as Response, false, SetErrorCode.INVALID_REQUEST, "An error occurred while processing the request.");

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(res.json).toHaveBeenCalledWith({
            err: "invalid_request",
            description: "An error occurred while processing the request."
        });
    });
});