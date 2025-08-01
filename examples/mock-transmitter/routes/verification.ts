import { Router, Request, Response } from 'express'
import { verifyJwt } from '../auth/verifyJwt'
import { signSignal } from '../services/fakeKmsSigner'
import { postToReceiver } from '../services/postToReceiver'

const router = Router()

router.post('/verification', verifyJwt, async (req: Request, res: Response) => {
  const user = (req as any).user

  const signal = {
    iss: 'https://mock-transmitter.example.com',
    sub: user.sub,
    iat: Math.floor(Date.now() / 1000),
    signal: 'ACCOUNT_DISABLED',
    reason: 'Suspicious behavior'
  }

  try {
    const signedSignal = await signSignal(signal)

    const receiverUrl = 'https://example-receiver.com/signals' // Replace later
    await postToReceiver(receiverUrl, signedSignal)

    res.status(200).json({ message: 'Signal sent to receiver', signedSignal })
  } catch (err) {
    console.error('Error in /verification:', err)
    res.status(500).json({ error: 'Failed to sign or send signal' })
  }
})

export default router
