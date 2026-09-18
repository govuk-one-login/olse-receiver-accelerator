import * as jose from "jose";
import type { webcrypto } from "node:crypto";

const getPublicKeyFromRemote = (url: string): jose.RemoteJWKSet =>
  jose.createRemoteJWKSet(new URL(url));

const getPublicKeyFromJWK = async (
  jwk: Record<string, unknown>,
): Promise<webcrypto.CryptoKey | Uint8Array> => await jose.importJWK(jwk);

export { getPublicKeyFromJWK, getPublicKeyFromRemote };
