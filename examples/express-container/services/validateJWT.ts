import { JsonWebKey, createVerify } from "crypto";
import { JWSFailedVerification } from "../errors/JWSFailedVerification";
import { RequestValidation } from "./RequestValidation";
import { getClientPublicKey } from "../services/clients/publicKey"; 

/**
 * Verifies JWS and returns decoded payload
 *
 * @param jws Stringified JWS
 * @param jwk Public key in JWK format
 * @returns Decoded JWS Payload
 */
export async function verifyJWS(
  jws: string,
  jwk: JsonWebKey,
): Promise<string> {
  const [header, payload, signature] = jws.split('.');
  if (!header || !payload || !signature) {
    throw new Error(JWSFailedVerification.failureReason);
  }

  const decodedPayload = Buffer.from(payload, 'base64url').toString('utf8');
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${header}.${payload}`);
  let result: boolean = false;
  try {
    result = verifier.verify(
      { key: jwk, format: 'jwk' },
      signature,
      'base64url'
    );
    if (!result) {
      const jwsError = new Error();
      jwsError.name = JWSFailedVerification.failureMessage;
      jwsError.message = JWSFailedVerification.failureReason;
      throw jwsError;
    }
    return decodedPayload;
  } catch (error: unknown) {
    const jwsError = new Error();
    jwsError.name =
      error instanceof Error
        ? error?.name || JWSFailedVerification.failureMessage
        : JWSFailedVerification.failureMessage;
    jwsError.message =
      error instanceof Error
        ? error?.message || JWSFailedVerification.failureReason
        : JWSFailedVerification.failureReason;
    throw jwsError;
  }
}

export async function verifyAndDecodeSignature(
  jws: string,
  clientID: string,
): Promise<{ isValid: boolean; decodedPayload?: string; error?: any }> {
  const [header] = jws.split('.');
  let decodedHeader: any;
  try {
    decodedHeader = JSON.parse(
      Buffer.from(header, 'base64url').toString('utf8')
    );
  } catch {
    return { isValid: false, error: { failureReason: "Invalid JWS header" } };
  }
  if (!decodedHeader.kid) {
    return { isValid: false, error: { failureReason: "Missing kid in header" } };
  }
  const publicKeyResult = await getClientPublicKey(clientID, decodedHeader.kid);
  if (publicKeyResult.error || !publicKeyResult.publicKey) {
    return { isValid: false, error: publicKeyResult.error };
  }
  try {
    const decodedPayload = await verifyJWS(jws, publicKeyResult.publicKey);
    if (!decodedPayload) {
      return { isValid: false, error: JWSFailedVerification };
    }
    return { isValid: true, decodedPayload };
  } catch (error) {
    return { isValid: false, error: JWSFailedVerification };
  }
}

export async function validateJWT(
  jwtBody: string,
  clientID: string,
): Promise<{
  isValid: boolean;
  error?: string;
  parsedSignedMessage?: unknown;
  signedMessage?: any;
}> {
  try {
    RequestValidation.validateInboundEvent(jwtBody);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { isValid: false, error: error.message };
    } else {
      return { isValid: false, error: "Unexpected error during validation" };
    }
  }

  const signedMessage = await verifyAndDecodeSignature(
    jwtBody,
    clientID
  );
  if (!signedMessage.isValid) {
    return {
      isValid: false,
      error: signedMessage.error?.failureReason,
      signedMessage
    };
  }

  let parsedSignedMessage;
  try {
    parsedSignedMessage = JSON.parse(signedMessage.decodedPayload as string);
  } catch (e) {
    return { isValid: false, error: "Invalid JWT payload: JSON parse error" };
  }

  return {
    isValid: true,
    parsedSignedMessage,
    signedMessage
  };
}