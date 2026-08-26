// oxlint-disable no-magic-numbers id-length
import { handler, jwkArray } from "./handler";
import { getEnv } from "../utils";
import { getKmsPublicKey } from "../kmsService";

vi.mock(import("../utils"));
vi.mock(import("../kmsService"));
vi.mock(import("./createJwksFromRawPublicKey"), () => ({
  createJwkFromRawPublicKey: vi.fn(() => ({
    e: "keyExpontent456",
    kid: "test-key-id-001",
    kty: "RSA",
    n: "keyModulus456",
  })),
}));

const mockGetEnv = vi.mocked(getEnv);
const mockGetKmsPublicKey = vi.mocked(getKmsPublicKey);

describe("jwks handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    jwkArray.length = 0;
  });

  it("processes and returns all keys successfully", async () => {
    const mockPublicKey = {
      keyId: "test-key-id-001",
      publicKey: new Uint8Array([1, 2, 3]),
    };

    mockGetEnv.mockReturnValue("test-kms-key-001");
    mockGetKmsPublicKey.mockResolvedValue(mockPublicKey);

    const result = await handler();

    expect(result.statusCode).toBe(200);
  });

  it("returns 500 when key retrieve fails", async () => {
    mockGetEnv.mockReturnValue("test-kms-key-001");
    mockGetKmsPublicKey.mockRejectedValue(new Error("Error"));
    const result = await handler();

    expect(result.statusCode).toBe(500);
  });
});
