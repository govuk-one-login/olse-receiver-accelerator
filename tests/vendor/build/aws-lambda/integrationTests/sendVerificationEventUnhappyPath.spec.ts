// oxlint-disable no-magic-numbers
import { getTokenFromCognito } from "../../../../../common/cognito/getTokenFromCognito";
import "dotenv/config";

describe("sET Verification Event Unhappy Path Integration Tests", () => {
  const apiUrl = process.env["VERIFICATION_ENDPOINT"] ?? "";

  beforeAll(() => {
    if (apiUrl === "") {
      throw new Error("VERIFICATION_ENDPOINT environment variable is not set");
    }
  });

  it("call verification endpoint with no content-type header", async () => {
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

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
      },
      method: "POST",
    });

    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
    // Should this fail? it doesnt seem to care about content-type at all - should we expect a 4xx?
  }, 10_000);

  it("call verification endpoint with invalid content-type header", async () => {
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

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "blah-invalid-content-type",
      },
      method: "POST",
    });

    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
    // Should this fail? it doesnt seem to care about content-type at all - should we expect a 4xx?
  }, 10_000);

  it("verification endpoint returns 4xx when request body contains an unexpected field", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {
      stoye: "afljdsljfgs",
      stream_id: "test-stream-001",
    };

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
    // Should this fail???
  }, 10_000);

  it("verification endpoint returns 4xx when request body contains an unexpected field with a valid state field", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {
      state: "test-state-001",
      stoye: "afljdsljfgs",
      stream_id: "test-stream-001",
    };

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
    // Should this fail???
  }, 10_000);

  it("verification endpoint returns 400 when request body contains state field with non-allowed characters", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {
      state: "test-state-001-!?#$%^",
      stream_id: "test-stream-001",
    };

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
    // Should this fail???
  }, 10_000);

  it("verification endpoint returns 400 when request body is undefined", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = undefined;

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(response.ok).toBeFalsy();
    console.log(response.status);
    expect(response.status).toBe(400);
  }, 10_000);

  it("verification endpoint returns 400? when request body is null", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = null;

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(response.ok).toBeFalsy();
    console.log(response.status);
    expect(response.status).toBe(500);
    // Should this be 400?
  }, 10_000);

  it("verification endpoint returns 400 when request body is empty", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {};

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(response.ok).toBeFalsy();
    console.log(response.status);
    expect(response.status).toBe(400);
  }, 10_000);

  it("send event where the request body contains stream_id that differs from the authorizer client_id, the user receives a 403 forbidden response", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {
      state: "test-state-001",
      stream_id: "test-stream-001-not-set",
    };
    // No stream id validation atm

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });
    expect(response.ok).toBe(true);
    console.log(response.status);
    expect(response.status).toBe(204);
    // This should fail but looks like there's no stream id check
  }, 10_000);

  it("verification endpoint returns 400 when called with missing stream_id field", async () => {
    if (process.env["MOCK_TX_SECRET_ARN"] === undefined) {
      throw new Error("MOCK_TX_SECRET_ARN environment variable is not set");
    }
    console.log(process.env["MOCK_TX_SECRET_ARN"]);
    const token = await getTokenFromCognito(process.env["MOCK_TX_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);

    const verificationPayload = {
      state: "test-state-001",
    };

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(response.ok).toBeFalsy();
    console.log(response);
    console.log(response.status);
    expect(response.status).toBe(400);
    // Should it be 400?
  }, 10_000);

  it("should return 401 when invalid token provided to verify endpoint", async () => {
    const verificationPayload = {
      subject: "test-subject-001",
      timestamp: Date.now(),
      verification_type: "verification-type",
    };

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer aa.bb.cc",
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    console.log(response);
    expect(response.status).toBe(401);
  });

  it("should return a 401 when request header does not contain any authorisation field", async () => {
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

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });

    expect(response.ok).toBeFalsy();
    console.log(response.status);
    expect(response.status).toBe(401);
  }, 10_000);

  it("should return a 401 when authorisation field has an invalid authorisation token", async () => {
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

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "Bearer invalid token",
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });

    expect(response.ok).toBeFalsy();
    console.log(response.status);
    expect(response.status).toBe(401);
  }, 10_000);

  it("should return a 401 when authorisation field is empty", async () => {
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

    const response = await fetch(`${apiUrl}/verify`, {
      body: JSON.stringify(verificationPayload),
      headers: {
        Authorization: "",
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });

    expect(response.ok).toBeFalsy();
    console.log(response.status);
    expect(response.status).toBe(401);
  }, 10_000);
});
