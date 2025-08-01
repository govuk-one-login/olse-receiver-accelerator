import { Router, Request, Response } from 'express'
import { verifyJwt } from '../auth/verifyJwt'

const router = Router()

router.get('/test', verifyJwt, (req: Request, res: Response) => {
  const user = (req as any).user
  res.json({ message: 'Protected route accessed!', user })
})

export default router
