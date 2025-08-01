import { Request, Response, NextFunction } from 'express'

/**
 * Placeholder middleware for JWT verification.
 * Replace with Cognito integration later.
 */
export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }

  // TODO: Replace this stub with JWT verification using Cognito JWKS
  if (token === 'mock-valid-token') {
    ;(req as any).user = { sub: '1234', email: 'mock@example.com' } // mock user info
    return next()
  }

  return res.status(401).json({ error: 'Invalid or expired token (mock)' })
}
