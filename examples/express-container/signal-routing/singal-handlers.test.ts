import { handleAccountDisabled, handleAccountPurged } from "./signal-handlers";

describe("Signal Handlers", () => {
    const mockReq = {} as any;
    let mockRes: any;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it("handleAccountPurged should return status code 200", async () => {
        const signalPayload: any = { subject: "user0" };
        const eventData = { reason: "user requested deletion" };

        await handleAccountPurged(signalPayload, eventData, mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: "Account purged.",
        });
    });

    it("handleAccountDisabled should return status code 200", async () => {
        const signalPayload: any = { subject: "user1" };
        const eventData = { reason: "admin action" };

        await handleAccountDisabled(signalPayload, eventData, mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: "Account disabled.",
        });
    });
});