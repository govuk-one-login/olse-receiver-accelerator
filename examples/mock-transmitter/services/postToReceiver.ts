import axios from 'axios'

export async function postToReceiver(url: string, signedSignal: string) {
  try {
    const res = await axios.post(
      url,
      { jws: signedSignal },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    console.log('Sent to receiver:', res.status)
  } catch (error: any) {
    console.error('Error sending to receiver:', error?.message)
    throw error
  }
}
