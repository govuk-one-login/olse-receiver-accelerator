// oxlint-disable no-magic-numbers
import { createJwkFromRawPublicKey, uint8ArrayToBase64 } from "./createJwksFromRawPublicKey";
import type { KeyObject } from "node:crypto";
import { createPublicKey } from "node:crypto";

vi.mock(import("node:crypto"));

const mockCreatePublicKey = vi.mocked(createPublicKey);

describe("uint8ArrayToBase64", () => {
  it("converts uint8 to base 64", () => {
    const result = uint8ArrayToBase64(new Uint8Array([1, 2, 3]));
    expect(result).toBe("AQID");
  });
});

describe("createJwkFromRawPublicKey", () => {
  it("creates jwk successfully", () => {
    // oxlint-disable-next-line id-length
    const mockJwk = { kty: "RSA", n: "test-001" };
    mockCreatePublicKey.mockReturnValue({
      export: vi.fn().mockReturnValue(mockJwk),
    } as unknown as KeyObject);

    const result = createJwkFromRawPublicKey(new Uint8Array([1, 2, 3]), "test-key-001");

    expect(result["kid"]).toBe("test-key-001");
  });

  it("throws error when fails to create public key", () => {
    mockCreatePublicKey.mockImplementation(() => {
      throw new Error("Invalid key");
    });

    expect(() => createJwkFromRawPublicKey(new Uint8Array([1, 2, 3]), "test-key-001")).toThrow(
      "Could not create Public Key. Imported key may be in an incorrect format",
    );
  });
});
