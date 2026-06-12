import { randomBytes, createHmac } from 'crypto'

export function generateToken() {
  return randomBytes(32).toString('hex')
}

export function hashToken(token) {
  return createHmac('sha256', process.env.TOKEN_SECRET)
    .update(token)
    .digest('hex')
}
