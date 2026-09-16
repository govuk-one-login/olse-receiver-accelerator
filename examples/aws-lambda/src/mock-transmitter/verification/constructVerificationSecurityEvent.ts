// oxlint-disable no-magic-numbers
import type { SET, SETVerificationRequest } from "../mockApiTxInterfaces";

function addStateToVerificationEvent(set: SET, state: string): void {
  const verificationEvent =
    set.events["https://schemas.openid.net/secevent/ssf/event-type/verification"];
  if (verificationEvent) {
    verificationEvent.state = state;
  }
}

export function constructVerificationFullSecurityEvent(
  requestId: string,
  timeStamp: number,
  verificationReqeuest: SETVerificationRequest,
): SET {
  const set: SET = {
    aud: process.env["AUDIENCE"] ?? "https://gds.co.uk/rp/Events",
    events: {
      "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
    },
    iat: Math.floor(timeStamp / 1000),
    iss: process.env["ISSUER"] ?? "https://gds.co.uk/mock/verify",
    jti: requestId,
    sub_id: {
      format: "opaque",
      id: verificationReqeuest.stream_id,
    },
  };

  if (verificationReqeuest.state) {
    addStateToVerificationEvent(set, verificationReqeuest.state);
  }

  return set;
}
