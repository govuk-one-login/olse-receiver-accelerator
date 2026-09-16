interface RequestBody {
  stream_id: string;
  state?: string;
}

interface KmsPublicKeyData {
  keyId: string;
  publicKey: Uint8Array;
}

interface SETVerificationRequest {
  stream_id: string;
  state: string | undefined;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SET {
  iss: string;
  aud: string;
  iat: number;
  jti: string;
  events: Record<
    string,
    {
      state?: string;
    }
  >;
  sub_id: {
    format: "opaque";
    id: string;
  };
}

export type { RequestBody, KmsPublicKeyData, SETVerificationRequest, TokenResponse, SET };
