// oxlint-disable no-magic-numbers unicorn/no-null
import { getKmsPublicKey, signedJWTWithKMS } from "./kmsService";
import type { KMSClient } from "@aws-sdk/client-kms";
import type { SET } from "./mockApiTxInterfaces";
import { getKMSClient } from "../sdk/sdkClient";

vi.mock(import("@aws-sdk/client-kms"));
vi.mock(import("../sdk/sdkClient"));

const mockSend = vi.fn();
vi.mocked(getKMSClient).mockReturnValue({
  send: mockSend,
} as unknown as KMSClient);

describe("signedJwtWithKms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env["AWS_REGION"] = "eu-west-2";
    process.env["KMS_KEY_ID"] = "test-key-001";
  });

  it("creates valid jwt", async () => {
    const mockSignature = new Uint8Array([1, 2, 3]);
    mockSend.mockResolvedValue({
      Signature: mockSignature,
    });

    const payload = { exp: 123, sub: "user001" };
    const result = await signedJWTWithKMS(payload as unknown as SET);

    expect(result.split(".")).toHaveLength(3);
  });

  it("throws error when KMS_KEY_ID not set", async () => {
    delete process.env["KMS_KEY_ID"];
    await expect(signedJWTWithKMS({} as unknown as SET)).rejects.toThrow(
      "Missing environment variable: KMS_KEY_ID",
    );
  });

  it("throws error when KMS sign fails", async () => {
    mockSend.mockResolvedValue({ Signature: null });

    await expect(signedJWTWithKMS({} as unknown as SET)).rejects.toThrow("KMS signing failed");
  });
});

describe("getKmsPublicKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env["AWS_REGION"] = "eu-west-2";
    process.env["KMS_KEY_ID"] = "test-key-001";
  });

  it("gets public key successfully", async () => {
    const mockPublicKey = new Uint8Array([1, 2, 3]);
    const mockKeyId = "test-key-id-001";

    mockSend.mockResolvedValue({
      KeyId: mockKeyId,
      PublicKey: mockPublicKey,
    });

    const result = await getKmsPublicKey("key-arn");

    expect(result).toStrictEqual({
      keyId: mockKeyId,
      publicKey: mockPublicKey,
    });
  });

  it("throws error when get public key fails", async () => {
    mockSend.mockResolvedValue({
      KeyId: null,
      PublicKey: null,
    });

    await expect(getKmsPublicKey("key-arn")).rejects.toThrow(
      "Failed to retrieve public key for key-arn",
    );
  });
});
