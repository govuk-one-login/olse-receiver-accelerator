import { createPublicKey } from "crypto";

export function createJwkFromRawPublicKey(publicKeyData: Uint8Array, keyId: string): Record<string, unknown> {
  const stringPublicKey = uint8ArrayToBase64(publicKeyData);

  const formattedPublicKey =
    "-----BEGIN PUBLIC KEY-----\n" + stringPublicKey + "\n-----END PUBLIC KEY-----";

  try {
    const jsonWebKey = createPublicKey(formattedPublicKey).export({
      format: "jwk",
    });

    (jsonWebKey as Record<string, unknown>)["kid"] = keyId;
    return jsonWebKey as Record<string, unknown>;
  } catch {
    throw Error("Could not create Public Key. Imported key may be in an incorrect format");
  }
}

export const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  return Buffer.from(uint8Array).toString("base64");
};
