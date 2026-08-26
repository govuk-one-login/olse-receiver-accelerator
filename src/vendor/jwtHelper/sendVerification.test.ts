// oxlint-disable vitest/prefer-spy-on
import { createVerificationJwt } from "./createVerificationJWT";
import { sendVerificationSignal } from "./sendVerification";

vi.mock(import("./createVerificationJWT"));
vi.mock(import("jose"));
vi.mock(import("node:crypto"));

const mockedCreateVerificationJwt = vi.mocked(createVerificationJwt);
describe("sendVerificationSignal", () => {
  const mockRelyingPartyUrl = "https://signal-exchange.account.gov.uk";
  const mockStreamId = "test-stream-id-1";

  beforeEach(() => {
    vi.clearAllMocks();

    mockedCreateVerificationJwt.mockResolvedValue("state-jwt");
  });

  it("returns true when response.ok is true", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

    const result = await sendVerificationSignal(mockRelyingPartyUrl, mockStreamId);

    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(mockRelyingPartyUrl, {
      body: JSON.stringify({ state: "state-jwt", stream_id: mockStreamId }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });
  });

  it("returns false when response.ok is false", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    await expect(sendVerificationSignal(mockRelyingPartyUrl, mockStreamId)).resolves.toBe(false);
  });

  it("returns false when an error is thrown", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("some error"));

    await expect(sendVerificationSignal(mockRelyingPartyUrl, mockStreamId)).resolves.toBe(false);
  });
});
