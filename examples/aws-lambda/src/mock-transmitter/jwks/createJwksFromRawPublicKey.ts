import { createPublicKey, JsonWebKey } from 'crypto'
import { KmsPublicKeyData } from '../kmsService'

export function createJwkFromRawPublicKey(
  publicKeyData: KmsPublicKeyData
): JsonWebKey {
  const stringPublicKey = uint8ArrayToBase64(publicKeyData.publicKey)

  const formattedPublicKey =
    '-----BEGIN PUBLIC KEY-----\n' +
    stringPublicKey +
    '\n-----END PUBLIC KEY-----'

  try {
    const jsonWebKey = createPublicKey(formattedPublicKey).export({
      format: 'jwk'
    })

    jsonWebKey['kid'] = publicKeyData.keyId
    return jsonWebKey
  } catch {
    throw Error(
      'Could not create Public Key. Imported key may be in an incorrect format'
    )
  }
}

export const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  return Buffer.from(uint8Array).toString('base64')
}
