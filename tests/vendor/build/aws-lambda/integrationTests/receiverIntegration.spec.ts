// oxlint-disable no-magic-numbers
import "dotenv/config";
import type { SET } from "../../../../../examples/aws-lambda/src/mock-transmitter/mockApiTxInterfaces";
import { getTokenFromCognito } from "../../../../../common/cognito/getTokenFromCognito";
import { signedJWTWithKMS } from "../../../../../examples/aws-lambda/src/mock-transmitter/kmsService";

describe("handler V1", () => {
  it("handler returns 202 when a valid access token is provided", async () => {
    const apiUrl = process.env["RECEIVER_ENDPOINT"] ?? "";
    if (apiUrl === "") {
      throw new Error("RECEIVER_ENDPOINT environment variable is not set");
    }
    if (apiUrl === "") {
      throw new Error("RECEIVER_ENDPOINT environment variable is not set");
    }

    const token = await getTokenFromCognito(process.env["RECEIVER_SECRET_ARN"] ?? "");

    const testSet: SET = {
      aud: "https://gds.co.uk",
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {
          state: "test-state-001",
        },
      },
      iat: Math.floor(Date.now() / 1000),
      iss: "https://gds.co.uk",
      jti: "test-id-001",
      sub_id: { format: "opaque", id: "test-sub-001" },
    };

    const jwt = await signedJWTWithKMS(testSet);
    console.log(`Bearer ${token}`);
    const response = await fetch(apiUrl, {
      body: jwt,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });
    expect(response.status).toBe(202);
  }, 10_000);

  it("handler returns 400 when malformed JWT in request body", async () => {
    const apiUrl = process.env["RECEIVER_ENDPOINT"] ?? "";
    const token = await getTokenFromCognito(process.env["RECEIVER_SECRET_ARN"] ?? "");

    console.log(`Bearer ${token}`);
    const response = await fetch(apiUrl, {
      body: "blah-malformed-JWT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });
    expect(response.status).toBe(400);
    // Is the correct error response?
  }, 10_000);

  it("handler returns 400 when invalid JWT in request body", async () => {
    const apiUrl = process.env["RECEIVER_ENDPOINT"] ?? "";
    const token = await getTokenFromCognito(process.env["RECEIVER_SECRET_ARN"] ?? "");

    console.log(`Bearer ${token}`);
    const response = await fetch(apiUrl, {
      body: "eyJhbGciOiJSUzI1NiIsInR5cCI6InNlY2V2ZW50K2p3dCIsImtpZCI6ImFybjphd3M6a21zOmV1LXdlc3QtMjo4NjczMjI3Nzk2NjI6a2V5LzI0Y-invalidJWT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });
    expect(response.status).toBe(400);
    // Is the correct error response?
  }, 10_000);

  it("handler returns 401 when no valid access token is provided", async () => {
    const apiUrl = process.env["RECEIVER_ENDPOINT"] ?? "";
    if (apiUrl === "") {
      throw new Error("RECEIVER_ENDPOINT environment variable is not set");
    }

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: "Bearer thisisnot.avalid.accesstoken",
      },
      method: "POST",
    });
    console.log(response);
    console.log(await response.json());
    expect(response.status).toBe(401);
  });

  it("handler returns 401 when no Content-Type header is provided", async () => {
    const apiUrl = process.env["RECEIVER_ENDPOINT"] ?? "";
    if (apiUrl === "") {
      throw new Error("RECEIVER_ENDPOINT environment variable is not set");
    }
    const testSet: SET = {
      aud: "https://gds.co.uk",
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {
          state: "test-state-001",
        },
      },
      iat: Math.floor(Date.now() / 1000),
      iss: "https://gds.co.uk",
      jti: "test-id-001",
      sub_id: { format: "opaque", id: "test-sub-001" },
    };

    const jwt = await signedJWTWithKMS(testSet);
    const token = await getTokenFromCognito(process.env["RECEIVER_SECRET_ARN"] ?? "");
    console.log(`Bearer ${token}`);
    console.log(`url : ${apiUrl}`);
    const response = await fetch(apiUrl, {
      body: jwt,
      method: "POST",
    });
    console.log(response);
    console.log(await response.json());
    expect(response.status).toBe(401);
  });

  it("handler returns 202? when Content-type is set to application/json", async () => {
    const apiUrl = process.env["RECEIVER_ENDPOINT"] ?? "";
    const token = await getTokenFromCognito(process.env["RECEIVER_SECRET_ARN"] ?? "");

    const testSet: SET = {
      aud: "https://gds.co.uk",
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {
          state: "test-state-001",
        },
      },
      iat: Math.floor(Date.now() / 1000),
      iss: "https://gds.co.uk",
      jti: "test-id-001",
      sub_id: { format: "opaque", id: "test-sub-001" },
    };

    const jwt = await signedJWTWithKMS(testSet);
    console.log(`Bearer ${token}`);
    const response = await fetch(apiUrl, {
      body: jwt,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    expect(response.status).toBe(202);
    // This should fail right?
  }, 10_000);

  it("handler returns 202? when request is missing a required field", async () => {
    const apiUrl = process.env["RECEIVER_ENDPOINT"] ?? "";
    const token = await getTokenFromCognito(process.env["RECEIVER_SECRET_ARN"] ?? "");

    const testSet: SET = {
      aud: "https://gds.co.uk",
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {
          state: "test-state-001",
        },
      },
      iat: Math.floor(Date.now() / 1000),
      iss: "https://gds.co.uk",
      jti: "test-id-001",
      sub_id: { format: "opaque", id: "test-sub-001" },
    };

    const jwt = await signedJWTWithKMS(testSet);
    console.log(`Bearer ${token}`);
    const response = await fetch(apiUrl, {
      body: jwt,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Typo": "application/json",
      },
      method: "POST",
    });
    expect(response.status).toBe(202);
    // This should fail????
  }, 10_000);
});
