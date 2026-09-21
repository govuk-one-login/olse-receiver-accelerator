import { createVerificationJwt } from "./createVerificationJWT";
import { baseLogger as logger } from "../../../common/logging/logger";

export async function sendVerificationSignal(
  relyingPartyUrl: string,
  streamId: string,
): Promise<boolean> {
  try {
    const verificationJwt = await createVerificationJwt(relyingPartyUrl, streamId);

    const requestBody = {
      state: verificationJwt,
      stream_id: streamId,
    };

    const response = await fetch(relyingPartyUrl, {
      body: JSON.stringify(requestBody),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/secevent+jwt",
      },
      method: "POST",
    });
    if (response.ok) {
      logger.info("Verification signal sent successfully to: ", {
        relyingPartyUrl: relyingPartyUrl,
      });
      return true;
    } else {
      logger.error("Failed to send verification signal:", {
        statusText: response.statusText,
      });
      return false;
    }
  } catch (error) {
    logger.error("Error sending verification signal:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
