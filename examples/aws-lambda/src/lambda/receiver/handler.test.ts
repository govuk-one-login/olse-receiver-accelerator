// oxlint-disable no-magic-numbers capitalized-comments sort-keys
import * as jose from "jose";
import type { APIGatewayProxyEvent } from "aws-lambda";
import type { Mock } from "vitest";
import { getParameter } from "../../../../../common/ssm/ssm";
import { getPublicKeyFromRemote } from "../../../../../src/vendor/publicKey/getPublicKey";
import { handleSignalRouting } from "../../../../../common/signalRouting/signalRouter";
import { handler } from "./handler";
import { lambdaLogger } from "../../../../../common/logging/logger";
import { validateJWTWithRemoteKey } from "../../../../../src/vendor/jwt/validateJWT";
import { validateSignalAgainstSchemas } from "../../../../../src/vendor/validateSchema/validateSchema";

vi.mock(import("../../../../../src/vendor/publicKey/getPublicKey"));
vi.mock(import("../../../../../src/vendor/jwt/validateJWT"));
vi.mock(import("../../../../../src/vendor/validateSchema/validateSchema"));
vi.mock(import("../../../../../common/signalRouting/signalRouter"));
vi.mock(import("../../../../../common/ssm/ssm"));
// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock("../../../../../common/logging/logger", () => ({
  lambdaLogger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

type VerifyResult = Awaited<ReturnType<typeof validateJWTWithRemoteKey>>;

const mockGetPublicKeyFromRemote = vi.mocked(getPublicKeyFromRemote);
const mockValidateJWTWithRemoteKey = vi.mocked(validateJWTWithRemoteKey);
const mockValidateSignalAgainstSchemas = vi.mocked(validateSignalAgainstSchemas);
const mockHandleSignalRouting = vi.mocked(handleSignalRouting);
const mockGetParameter = vi.mocked(getParameter);

const fetchMock: Mock<typeof fetch> = vi.fn();
global.fetch = fetchMock;

const mockJwtPayload = {
  events: {
    "https://schemas.openid.net/secevent/ssf/event-type/verification": {
      state: "test-state",
    },
  },
  sub_id: { format: "opaque", id: "test-id" },
};

const baseEvent: Partial<APIGatewayProxyEvent> = {
  body: "1.2.3",
  requestContext: {
    requestId: "test-request-id-001",
  } as APIGatewayProxyEvent["requestContext"],
};

let warnSpy: Mock;
let errorSpy: Mock;

describe("receiver handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    warnSpy = vi.spyOn(lambdaLogger, "warn");
    errorSpy = vi.spyOn(lambdaLogger, "error");

    process.env["RECEIVER_SECRET_ARN"] = "test-arn";
    process.env["AWS_STACK_NAME"] = "test-stack";

    mockGetParameter.mockResolvedValue("https://test.com/jwks");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ keys: [] }), { status: 200 }));

    const realRemoteJwks = jose.createRemoteJWKSet(new URL("https://test.com/jwks"));
    mockGetPublicKeyFromRemote.mockReturnValue(realRemoteJwks);
  });

  afterEach(() => {
    delete process.env["RECEIVER_SECRET_ARN"];
    delete process.env["AWS_STACK_NAME"];
  });

  it("returns 400 when request body is missing", async () => {
    const event = { ...baseEvent, body: null };
    const result = await handler(event as APIGatewayProxyEvent);
    expect(result.statusCode).toBe(400);
    expect(warnSpy).toHaveBeenCalledWith("Request missing body");
  });

  it("returns 400 when JWT validation fails", async () => {
    mockValidateJWTWithRemoteKey.mockRejectedValue(new Error("Invalid JWT"));
    const result = await handler(baseEvent as APIGatewayProxyEvent);
    expect(result.statusCode).toBe(400);
  });

  it("returns 400 when JWT payload is undefined", async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      key: new Uint8Array(),
      // oxlint-disable-next-line no-undefined
      payload: undefined,
      protectedHeader: { alg: "RS256" },
    } as unknown as VerifyResult);
    const result = await handler(baseEvent as APIGatewayProxyEvent);
    expect(result).toEqual({
      body: JSON.stringify({
        err: "invalid_request",
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition.",
      }),
      headers: { "Content-Type": "application/json" },
      statusCode: 400,
    });
    expect(warnSpy).toHaveBeenCalledWith("JWT payload is undefined");
  });

  it("returns 400 when schema validation fails", async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      key: new Uint8Array(),
      payload: mockJwtPayload,
      protectedHeader: { alg: "RS256" },
    } as unknown as VerifyResult);
    mockValidateSignalAgainstSchemas.mockResolvedValue({
      message: "Invalid schema",
      valid: false,
    });
    const result = await handler(baseEvent as APIGatewayProxyEvent);
    expect(result).toEqual({
      body: JSON.stringify({
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition.",
        err: "invalid_request",
      }),
      headers: { "Content-Type": "application/json" },
      statusCode: 400,
    });
    expect(warnSpy).toHaveBeenCalledWith("Schema validationg failed", { Error });
  });

  it("returns 400 when signal routing fails", async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      key: new Uint8Array(),
      payload: mockJwtPayload,
      protectedHeader: { alg: "RS256" },
    } as unknown as VerifyResult);
    mockValidateSignalAgainstSchemas.mockResolvedValue({
      schema: "test-schema",
      valid: true,
    });
    mockHandleSignalRouting.mockResolvedValue({ valid: false });
    const result = await handler(baseEvent as APIGatewayProxyEvent);
    expect(result).toEqual({
      body: JSON.stringify({
        description:
          "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition.",
        err: "invalid_request",
      }),
      headers: { "Content-Type": "application/json" },
      statusCode: 400,
    });
    expect(errorSpy).toHaveBeenCalledWith("failed to route signal");
  });

  it("returns 202 when signal processing succeeds", async () => {
    mockValidateJWTWithRemoteKey.mockResolvedValue({
      key: new Uint8Array(),
      payload: mockJwtPayload,
      protectedHeader: { alg: "RS256" },
    } as unknown as VerifyResult);
    mockValidateSignalAgainstSchemas.mockResolvedValue({
      schema: "test-schema",
      valid: true,
    });
    mockHandleSignalRouting.mockResolvedValue({
      schema: "test-schema",
      valid: true,
    });
    const result = await handler(baseEvent as APIGatewayProxyEvent);
    expect(result).toEqual({
      body: "",
      headers: { "Content-Type": "application/json" },
      statusCode: 202,
    });
    expect(mockHandleSignalRouting).toHaveBeenCalledWith(mockJwtPayload, "test-schema");
  });

  it("returns 500 when unexpected error occurs", async () => {
    mockGetPublicKeyFromRemote.mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const result = await handler(baseEvent as APIGatewayProxyEvent);
    // expect(result).toMatchObject({
    //   body: JSON.stringify({
    //     description: "An internal error occurred",
    //     err: "internal_error",
    //   }),
    //   headers: { "Content-Type": "application/json" },
    //   statusCode: 500,
    // });
    expect(result).toEqual({
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        err: "internal_error",
        description: "An internal error occurred",
      }),
    });
  });
});
