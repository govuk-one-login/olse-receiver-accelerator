import type { JsonWebKey } from "node:crypto";
import { createPublicKey } from "node:crypto";

const uint8ArrayToBase64 = (uint8Array: Uint8Array): string =>
  Buffer.from(uint8Array).toString("base64");

function createJwkFromRawPublicKey(publicKeyData: Uint8Array, keyId: string): JsonWebKey {
  const stringPublicKey = uint8ArrayToBase64(publicKeyData);

  const formattedPublicKey = `-----BEGIN PUBLIC KEY-----\n${stringPublicKey}\n-----END PUBLIC KEY-----`;

  try {
    const jsonWebKey = createPublicKey(formattedPublicKey).export({
      format: "jwk",
    });

    jsonWebKey["kid"] = keyId;
    return jsonWebKey;
  } catch {
    throw new Error("Could not create Public Key. Imported key may be in an incorrect format");
  }
}

export { createJwkFromRawPublicKey, uint8ArrayToBase64 };
