import * as jose from "jose";
import type { getPublicKeyFromRemote } from "../publicKey/getPublicKey";

async function validateJWT(
  jwt: string,
  publicKey: jose.CryptoKey | jose.KeyObject | jose.JWK | Uint8Array,
  options?: jose.JWTVerifyOptions,
): Promise<jose.JWTVerifyResult> {
  const result = await jose.jwtVerify(jwt, publicKey, options);
  return result;
}

async function validateJWTWithRemoteKey(
  jwt: string,
  publicKey: ReturnType<typeof getPublicKeyFromRemote>,
  options?: jose.JWTVerifyOptions,
): Promise<jose.JWTVerifyResult> {
  const result = await jose.jwtVerify(jwt, publicKey, options);
  return result;
}

export { validateJWT, validateJWTWithRemoteKey };
