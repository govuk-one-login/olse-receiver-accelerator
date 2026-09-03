// oxlint-disable no-magic-numbers
import * as jose from "jose";
import * as signalRouting from "../../common/signalRouting/signalRouter";
import { ConfigurationKeys } from "../../common/config/configurationKeys";
import { app } from "./express";
import { baseLogger } from "../../common/logging/logger";
import { generateJWT } from "../../src/vendor/auth/jwt";
import { getPublicKeyFromRemote } from "../../src/vendor/publicKey/getPublicKey";
import { getSecret } from "../../common/secretsManager/secretsManager";
import { readFileSync } from "node:fs";
import request from "supertest";
import { stopVerificationSignals } from "./verification/startHealthCheck";
import type { webcrypto } from "node:crypto";

vi.mock(import("../../src/vendor/publicKey/getPublicKey"), () => ({
  getPublicKeyFromRemote: vi.fn(),
}));

const loggerErrorSpy = vi.spyOn(baseLogger, "error");

vi.mock(import("../../common/secretsManager/secretsManager"), () => ({
  getSecret: vi.fn(),
}));

const mockGetSecret = vi.mocked(getSecret);

const sampleVerificationEvent = {
  alg: "RS256",
  audience: "https://aud.example.com",
  issuer: "https://issuer.example.com",
  jti: "123456",
  payload: {
    events: {
      "https://schemas.openid.net/secevent/ssf/event-type/verification": {
        state: "VGhpcyBpcyBhbiBleGFtcGxlIHN0YXRlIHZhbHVlLgo=",
      },
    },
    sub_id: {
      format: "opaque",
      id: "f67e39a0a4d34d56b3aa1bc4cff0069f",
    },
  },
  useExpClaim: false,
};

let publicKeyString;
let publicKeyJson;
let key: webcrypto.CryptoKey | Uint8Array;

describe("express server /v1 endpoint", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    vi.useFakeTimers();

    process.env[ConfigurationKeys.CLIENT_ID] = "test_client";
    process.env[ConfigurationKeys.CLIENT_SECRET] = "test_secret";
    process.env[ConfigurationKeys.PRIVATE_KEY_PATH] = "./keys/authPrivate.key";
    process.env[ConfigurationKeys.PUBLIC_KEY_PATH] = "./keys/authPublic.key";
    process.env[ConfigurationKeys.JWKS_URL] = "https://example.com/jwks";
    process.env[ConfigurationKeys.AWS_REGION] = "eu-west-2";

    publicKeyString = readFileSync("./keys/authPublic.key", {
      encoding: "utf8",
    });
    // eslint-disable-next-line
    publicKeyJson = JSON.parse(publicKeyString as any);
    key = await jose.importJWK(publicKeyJson as jose.JWK, "RS256");

    const privateKeyString = readFileSync("./keys/authPrivate.key", {
      encoding: "utf8",
    });
    mockGetSecret.mockResolvedValue(JSON.stringify({ privateKey: privateKeyString }));
  });

  afterEach(() => {
    stopVerificationSignals();
    vi.useRealTimers();
  });

  it("should return 400 for invalid grant type", async () => {
    const response = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "invalid_grant",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "invalid_grant" });
  });

  it("should return 401 for incorrect client_id", async () => {
    const response = await request(app).post("/v1/token").query({
      client_id: "wrong_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "invalid_client" });
  });

  it("should return 401 for incorrect client_secret", async () => {
    const response = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "wrong_secret",
      grant_type: "client_credentials",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "invalid_client" });
  });

  it("should return 401 when CLIENT_ID env var is missing", async () => {
    // eslint-disable-next-line
    delete process.env[ConfigurationKeys.CLIENT_ID];

    const response = await request(app)
      .post("/v1/token")
      .set("content-type", "application/secevent+jwt")
      .query({
        client_id: "test_client",
        client_secret: "test_secret",
        grant_type: "client_credentials",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "invalid_client" });
  });

  it("should return 401 when CLIENT_SECRET env var is missing", async () => {
    // eslint-disable-next-line
    delete process.env[ConfigurationKeys.CLIENT_SECRET];

    const response = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "invalid_client" });
  });

  it("should return 200 with valid credentials", async () => {
    process.env["CLIENT_ID"] = "test_client";
    process.env["CLIENT_SECRET"] = "test_secret";
    const response = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
    expect(response.body).toHaveProperty("token_type", "Bearer");
    expect(response.body).toHaveProperty("expires_in", 3600);
  });

  it("should return 202 for when sent a SET with a valid JWT and payload", async () => {
    // @ts-expect-error ignore type errors
    vi.mocked(getPublicKeyFromRemote).mockReturnValue(key);
    const jwt = await generateJWT(sampleVerificationEvent);

    const tokenResponse = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(tokenResponse.status).toBe(200);

    const accessToken = tokenResponse.body;

    const token = accessToken.access_token as string;

    const response = await request(app)
      .post("/v1/Events")
      .set("content-type", "application/secevent+jwt")
      .set("Authorization", `Bearer ${token}`)
      .send(jwt);

    expect(response.status).toBe(202);
  });

  it("should return 400 for when sent signal routing has failed", async () => {
    // @ts-expect-error ignore type errors
    vi.mocked(getPublicKeyFromRemote).mockReturnValue(key);

    const routeSpy = vi.spyOn(signalRouting, "handleSignalRouting");
    vi.mocked(routeSpy).mockResolvedValue({ valid: false });

    const jwt = await generateJWT(sampleVerificationEvent);

    const tokenResponse = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(tokenResponse.status).toBe(200);

    const accessToken = tokenResponse.body;

    const token = accessToken.access_token as string;

    const response = await request(app)
      .post("/v1/Events")
      .set("content-type", "application/secevent+jwt")
      .set("Authorization", `Bearer ${token}`)
      .send(jwt);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      description:
        "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition.",
      err: "invalid_request",
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith("failed to route signal", expect.any(Object));
  });

  it("should return 400 and invalid signal for when sent a SET with an invalid SET payload", async () => {
    // @ts-expect-error ignore type errors
    vi.mocked(getPublicKeyFromRemote).mockReturnValue(key);
    const jwt = await generateJWT({
      alg: "RS256",
      audience: "https://aud.example.com",
      issuer: "https://issuer.example.com",
      jti: "123456",
      payload: {
        events: {
          "https://schemas.openid.net/secevent/ssf/event-type/verification": {
            state: "VGhpcyBpcyBhbiBleGFtcGxlIHN0YXRlIHZhbHVlLgo=",
          },
        },
        foo: {
          format: "opaque",
          id: "f67e39a0a4d34d56b3aa1bc4cff0069f",
        },
      },
      useExpClaim: false,
    });

    const tokenResponse = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(tokenResponse.status).toBe(200);

    const accessToken = tokenResponse.body;

    const token = accessToken.access_token as string;

    const response = await request(app)
      .post("/v1/Events")
      .set("content-type", "application/secevent+jwt")
      .set("Authorization", `Bearer ${token}`)
      .send(jwt);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      description:
        "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition.",
      err: "invalid_request",
    });
  });

  it("should return 400 and invalid jwt for when sent a jwt that cannot be validated", async () => {
    const jwt =
      "LCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSJ9.gXrPZ3yM_60dMXGE69dusbpzYASNA-XIOwsb5D5xYnSxyj6_D6OR";

    const tokenResponse = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(tokenResponse.status).toBe(200);

    const accessToken = tokenResponse.body;

    const token = accessToken.access_token as string;

    const response = await request(app)
      .post("/v1/Events")
      .set("content-type", "application/secevent+jwt")
      .set("Authorization", `Bearer ${token}`)
      .send(jwt);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      description:
        "One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.).",
      err: "invalid_key",
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Failed to validate JWT with remote key",
      expect.any(Object),
    );
  });

  it("should return 401 for expired auth token", async () => {
    // @ts-expect-error ignore type errors
    vi.mocked(getPublicKeyFromRemote).mockReturnValue(key);
    const jwt = await generateJWT(sampleVerificationEvent);

    const tokenResponse = await request(app).post("/v1/token").query({
      client_id: "test_client",
      client_secret: "test_secret",
      grant_type: "client_credentials",
    });

    expect(tokenResponse.status).toBe(200);

    const token = tokenResponse.body.access_token as string;

    vi.advanceTimersByTime(3_600_000 + 1);

    const response = await request(app)
      .post("/v1/Events")
      .set("content-type", "application/secevent+jwt")
      .set("Authorization", `Bearer ${token}`)
      .send(jwt);

    expect(response.status).toBe(401);
  });
});
