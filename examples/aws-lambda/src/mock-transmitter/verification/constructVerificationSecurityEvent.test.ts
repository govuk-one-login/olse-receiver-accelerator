// oxlint-disable no-magic-numbers
import { constructVerificationFullSecurityEvent } from "./constructVerificationSecurityEvent";

describe("constructVerificationFullSecurityEvent", () => {
  it("creates SET", () => {
    const timeStamp = 10_001;
    const result = constructVerificationFullSecurityEvent("test-request-id-001", timeStamp, {
      state: "test-state-001",
      stream_id: "test-stream-id-001",
    });

    expect(result).toEqual({
      aud: "https://gds.co.uk/rp/Events",
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {
          state: "test-state-001",
        },
      },
      iat: Math.floor(timeStamp / 1000),
      iss: "https://gds.co.uk/mock/verify",
      jti: "test-request-id-001",
      sub_id: {
        format: "opaque",
        id: "test-stream-id-001",
      },
    });
  });
});
