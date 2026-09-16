// oxlint-disable no-magic-numbers
import type { SET, SETVerificationRequest } from "../mockApiTxInterfaces";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { ConfigurationKeys } from "../../../../../common/config/configurationKeys";
import type { Mock } from "vitest";
import { constructVerificationFullSecurityEvent } from "./constructVerificationSecurityEvent";
import { getEnv } from "../utils";
import { getParameter } from "../../../../../common/ssm/ssm";
import { getTokenFromCognito } from "../../../../../common/cognito/getTokenFromCognito";
import { getVerificationRequest } from "./requestParser";
import { handler } from "./handler";
import { isValidationError } from "./validation";
import { signedJWTWithKMS } from "../kmsService";

vi.mock(import("./requestParser"));
vi.mock(import("./constructVerificationSecurityEvent"));
vi.mock(import("../kmsService"));
vi.mock(import("./validation"));
vi.mock(import("../../../../../common/cognito/getTokenFromCognito"));
vi.mock(import("../../../../../common/ssm/ssm"));
vi.mock(import("../utils"));

const mockParseRequest = vi.mocked(getVerificationRequest);
const mockBuildSecurityEvent = vi.mocked(constructVerificationFullSecurityEvent);
const mockSignWithKms = vi.mocked(signedJWTWithKMS);
const mockCheckValidationError = vi.mocked(isValidationError);
const mockGetCognitoToken = vi.mocked(getTokenFromCognito);
const mockGetSsmParameter = vi.mocked(getParameter);
const mockReadEnv = vi.mocked(getEnv);

const fetchMock: Mock<typeof fetch> = vi.fn();
globalThis.fetch = fetchMock;

const mockEvent: Partial<APIGatewayProxyEvent> = {
  requestContext: { requestId: "test-request-id-001" },
} as unknown as APIGatewayProxyEvent;

describe("transmitter handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env["RECEIVER_SECRET_ARN"] = "arn";
    mockReadEnv.mockImplementation((key: string) => {
      if (key === ConfigurationKeys.AWS_STACK_NAME) {
        return "test-stack";
      }
      throw new Error(`Unexpected key: ${key}`);
    });
    mockGetSsmParameter.mockResolvedValue("https://receiver.com/events");
    mockGetCognitoToken.mockResolvedValue("mock-token");
    mockSignWithKms.mockResolvedValue("mock-jwt");
    fetchMock.mockResolvedValue(new Response("", { status: 202 }));
  });

  afterEach(() => {
    delete process.env["RECEIVER_SECRET_ARN"];
  });

  it("sends a verification event successfully", async () => {
    const request: SETVerificationRequest = {
      // oxlint-disable-next-line no-undefined
      state: undefined,
      stream_id: "user-123",
    };
    const securityEvent: SET = {
      aud: "audience",
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {
          state: "abc",
        },
      },
      iat: Math.floor(Date.now() / 1000),
      iss: "issuer",
      jti: "jti-123",
      sub_id: { format: "opaque", id: "user-123" },
    };
    mockParseRequest.mockReturnValue(request);
    mockBuildSecurityEvent.mockReturnValue(securityEvent);

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(204);
    expect(mockGetSsmParameter).toHaveBeenCalledWith("/test-stack/receiver-endpoint");
    expect(mockGetCognitoToken).toHaveBeenCalledWith("arn");
  });

  it("returns 400 for validation errors", async () => {
    const error = new Error("Invalid request");
    mockParseRequest.mockImplementation(() => {
      throw error;
    });
    mockCheckValidationError.mockReturnValue(true);

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 500 ifor internal errors", async () => {
    const error = new Error("Failure");
    mockParseRequest.mockImplementation(() => {
      throw error;
    });
    mockCheckValidationError.mockReturnValue(false);

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
