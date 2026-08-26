// oxlint-disable unicorn/numeric-separators-style
const verificationSignalWithState = {
  aud: "receiver.example.com",
  events: {
    "https://schemas.openid.net/secevent/ssf/event-type/verification": {
      state: "VGhpcyBpcyBhbiBleGFtcGxlIHN0YXRlIHZhbHVlLgo=",
    },
  },
  iat: 1493856000,
  iss: "https://transmitter.example.com",
  jti: "123456",
  sub_id: {
    format: "opaque",
    id: "f67e39a0a4d34d56b3aa1bc4cff0069f",
  },
};

const verificationSignalWithoutState = {
  aud: "receiver.example.com",
  events: {
    "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
  },
  iat: 1493856000,
  iss: "https://transmitter.example.com",
  jti: "123456",
  sub_id: {
    format: "opaque",
    id: "f67e39a0a4d34d56b3aa1bc4cff0069f",
  },
};

export { verificationSignalWithState, verificationSignalWithoutState };
