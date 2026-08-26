import { ConfigurationKeys } from "../../../common/config/configurationKeys";
import { config } from "../../../common/config/config";
import { generateJWT } from "../../../src/vendor/auth/jwt";
import type { generateJWTPayload } from "../../../src/vendor/types";
import { baseLogger as logger } from "../../../common/logging/logger";

export async function createVerificationJwt(
  relyingPartyUrl: string,
  streamId: string,
): Promise<string> {
  try {
    const ISSUER = config.get(ConfigurationKeys.ISSUER);

    const jwtPayload: generateJWTPayload = {
      alg: "RS256",
      audience: relyingPartyUrl,
      issuer: ISSUER,
      jti: `verification-${String(Date.now())}`,
      payload: {
        streamId: streamId,
      },
      useExpClaim: true,
    };

    return await generateJWT(jwtPayload);
  } catch (error) {
    logger.error("Error creating verification JWT:", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to create verification JWT", { cause: error });
  }
}
