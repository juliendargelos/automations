import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticate } from '../common/_google'

export default async (request: VercelRequest, response: VercelResponse) => {
  const token = await authenticate()

  if (!token) {
    response.status(403)
    return
  }

  console.log('ok!')
}
