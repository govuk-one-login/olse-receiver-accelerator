import { VerificationRequestPayload } from '../../../../src/vendor/types'
import { signedJWTWithKMS } from '../mock-transmitter/kmsService'

export async function createVerificationRequestJWT(
  streamId: string,
  state: string
): Promise<string> {
  const verificationRequestSet: VerificationRequestPayload = {
    stream_id: streamId,
    state: state
  }

  return await signedJWTWithKMS(verificationRequestSet)
}
