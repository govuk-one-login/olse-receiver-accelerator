import { handleVerificationSignal } from "./signalHandlers";
import { baseLogger as logger } from "../../common/logging/logger";

vi.mock(import("./verifyState"));

const loggerInfoSpy = vi.spyOn(logger, "info");

describe("handleVerificationSignal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns valid for verification signal without state", async () => {
    const jwtPayload = {
      events: {
        "https://schemas.openid.net/secevent/ssf/event-type/verification": {},
      },
      sub_id: { format: "opaque", id: "steam-id-001" },
    };

    const result = await handleVerificationSignal(jwtPayload);

    expect(result).toStrictEqual({ valid: true });
    expect(loggerInfoSpy).toHaveBeenCalledWith("Verification signal without state received");
  });
});
