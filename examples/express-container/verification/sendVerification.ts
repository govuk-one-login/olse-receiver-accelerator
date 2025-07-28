import { createVerificationJwt } from './createVerificationJWT.ts'

export async function sendVerificationSignal(
  relyingPartyUrl: string,
  streamId: string
): Promise<boolean> {
  try {
    const verificationJwt = await createVerificationJwt(
      relyingPartyUrl,
      streamId
    )

    const requestBody = {
      stream_id: streamId,
      state: verificationJwt
    }

    const response = await fetch(relyingPartyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    if (response.status === 204) {
      console.log(
        'Verification signal sent successfully to : ',
        relyingPartyUrl
      )
      return true
    } else {
      console.error('Failed to send verification signal:', response.statusText)
      return false
    }
  } catch (error) {
    console.error('Error sending verification signal:', error)
    return false
  }
}
