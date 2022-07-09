import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setToken } from '../common/_supabase'
import { getAuthClient } from '../common/_google'

export default async (request: VercelRequest, response: VercelResponse) => {
  const client = getAuthClient()

  if (request.query.code) {
    try {
      const { tokens } = await client.getToken(request.query.code as string)
      await setToken('google', tokens.refresh_token!)
      response.send('Authentication succeed')
    } catch (_) {
      response.send('Authentication failed')
    }

    return
  }

  response.redirect(client.generateAuthUrl({
    access_type: 'offline',
    scope: process.env.GOOGLE_SCOPES
  }))
}
