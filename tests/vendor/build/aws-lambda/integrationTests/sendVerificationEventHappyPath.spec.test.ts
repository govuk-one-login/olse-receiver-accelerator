// oxlint-disable no-magic-numbers no-console
import "dotenv/config";
import { getTokenFromCognito } from "../../../../../common/cognito/getTokenFromCognito";

describe("sET Verification Event Happy Path Integration Tests", () => {
  const apiUrl = process.env["VERIFICATION_ENDPOINT"] ?? "";

  beforeAll(() => {
    if (apiUrl === "") {
      throw new Error("VERIFICATION_ENDPOINT environment variable is not set");
    }
  });

  it("send event with valid stream_id and state and receives a 204", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {
      state: "test-state-001",
      stream_id: "test-stream-001",
    };
    // No stream id validation atm

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });

    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
  }, 10_000);

  it("send event with stream_id and without state and receives a 204", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {
      stream_id: "test-stream-001",
    };

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });

    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
  }, 10_000);
});
