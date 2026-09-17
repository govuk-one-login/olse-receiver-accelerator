import { describe, expect, it } from "vitest";
import { constructVerificationFullSecurityEvent } from "./constructVerificationSecurityEvent";

describe(constructVerificationFullSecurityEvent, () => {
  it("creates SET", () => {
    const timeStamp = 10_001;
    const result = constructVerificationFullSecurityEvent("test-request-id-001", timeStamp, {
      state: "test-state-001",
      stream_id: "test-stream-id-001",
    });

    expect(result).toStrictEqual({
      aud: "https://signal-exchange.account.gov.uk/rp/Events",
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {
          state: "test-state-001",
        },
      },
      iat: Math.floor(timeStamp / 1000),
      iss: "https://signal-exchange.account.gov.uk/mock/verify",
      jti: "test-request-id-001",
      sub_id: {
        format: "opaque",
        id: "test-stream-id-001",
      },
    });
  });
});
