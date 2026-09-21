import type { APIGatewayProxyEvent } from "aws-lambda";
import { getVerificationRequest } from "./requestParser";

describe("requestParter", () => {
  it("parses valid request", () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({
        state: "test-state-001",
        stream_id: "test-stream-id-001",
      }),
    };
    const result = getVerificationRequest(mockEvent as unknown as APIGatewayProxyEvent);

    expect(result).toStrictEqual({
      state: "test-state-001",
      stream_id: "test-stream-id-001",
    });
  });
});
