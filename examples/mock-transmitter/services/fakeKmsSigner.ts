import crypto from 'crypto'

export async function signSignal(
  payload: Record<string, any>
): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const base64url = (input: Buffer | string) =>
    Buffer.from(input).toString('base64url')

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const fakePrivateKey = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048
  }).privateKey

  const signature = crypto.sign('sha256', Buffer.from(signingInput), {
    key: fakePrivateKey
  })

  const encodedSignature = base64url(signature)

  return `${signingInput}.${encodedSignature}`
}
