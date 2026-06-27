import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

const SECRET = process.env.JWT_SECRET || 'fallback-secret'

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: '未授權，請重新登入' })
    return false
  }
  const token = auth.slice(7)
  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ error: 'Token 已過期，請重新登入' })
    return false
  }
  return true
}
