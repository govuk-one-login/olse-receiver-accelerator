// oxlint-disable unicorn/numeric-separators-style
import {
  verificationSignalWithState,
  verificationSignalWithoutState,
} from "../../../tests/testConstants";
import { validateSignalAgainstSchemas } from "../validateSchema/validateSchema";

describe("validateSignalAgainstSchema", () => {
  it("should return valid: true if signal does match one of the given schema", async () => {
    await expect(validateSignalAgainstSchemas(verificationSignalWithState)).resolves.toStrictEqual({
      schema: "./schemas/verificationEvent.json",
      valid: true,
    });
  });

  it("should return valid: true if signal does match one of the given schema without an optional field", async () => {
    await expect(
      validateSignalAgainstSchemas(verificationSignalWithoutState),
    ).resolves.toStrictEqual({
      schema: "./schemas/verificationEvent.json",
      valid: true,
    });
  });

  it("should return valid: false if signal does not match one of the given schema", async () => {
    const signalSet = {
      description: "description",
      iss: 2,
    };
    const validatedSignal = await validateSignalAgainstSchemas(signalSet);
    expect(validatedSignal.valid).toBe(false);
  });

  const invalidTestCases: {
    description: string;
    input: Record<string, unknown>;
    expectedValid: boolean;
  }[] = [
    {
      description: "missing required jti field",
      expectedValid: false,
      input: {
        aud: "receiver.example.com",
        events: {
          "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
        },
        iat: 1493856000,
        iss: "https://transmitter.example.com",
        sub_id: { format: "opaque", id: "f67e39a0a4d34d56b3aa1bc4cff0069f" },
      },
    },
    {
      description: "invalid iss type (number instead of string)",
      expectedValid: false,
      input: {
        aud: "receiver.example.com",
        events: {
          "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
        },
        iat: 1493856000,
        iss: 12345,
        jti: "123456",
        sub_id: { format: "opaque", id: "f67e39a0a4d34d56b3aa1bc4cff0069f" },
      },
    },
    {
      description: "invalid iat type",
      expectedValid: false,
      input: {
        aud: "receiver.example.com",
        events: {
          "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
        },
        iat: "1493856000",
        iss: "https://transmitter.example.com",
        jti: "123456",
        sub_id: { format: "opaque", id: "f67e39a0a4d34d56b3aa1bc4cff0069f" },
      },
    },
    {
      description: "missing sub_id.format field",
      expectedValid: false,
      input: {
        aud: "receiver.example.com",
        events: {
          "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
        },
        iat: 1493856000,
        iss: "https://transmitter.example.com",
        jti: "123456",
        sub_id: { id: "f67e39a0a4d34d56b3aa1bc4cff0069f" },
      },
    },
    {
      description: "empty events object",
      expectedValid: false,
      input: {
        aud: "receiver.example.com",
        events: {},
        iat: 1493856000,
        iss: "https://transmitter.example.com",
        jti: "123456",
        sub_id: { format: "opaque", id: "f67e39a0a4d34d56b3aa1bc4cff0069f" },
      },
    },
    {
      description: "additional unexpected field",
      expectedValid: false,
      input: {
        aud: "receiver.example.com",
        events: {
          "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
        },
        iat: 1493856000,
        iss: "https://transmitter.example.com",
        jti: "123456",
        sub_id: { format: "opaque", id: "f67e39a0a4d34d56b3aa1bc4cff0069f" },
        unexpectedField: "should not be here",
      },
    },
  ];

  it.each(invalidTestCases)("$description", async ({ input, expectedValid }) => {
    const result = await validateSignalAgainstSchemas(input);
    expect(result.valid).toBe(expectedValid);
  });
});
