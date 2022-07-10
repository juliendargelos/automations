import 'dotenv'
import { fetch } from '~/common/client.ts'

export const OAUTH_API_URL = 'https://accounts.google.com/o/oauth2'
export const OAUTH_TOKEN_ENDPOINT = `${OAUTH_API_URL}/token`

export async function authenticate(): Promise<string> {
  const data = await fetch(OAUTH_TOKEN_ENDPOINT, {
    method: 'post',
    body: {
      client_id: Deno.env.get('GOOGLE_ID'),
      client_secret: Deno.env.get('GOOGLE_SECRET'),
      refresh_token: Deno.env.get('GOOGLE_TOKEN'),
      grant_type: 'refresh_token'
    }
  })

  if (data.access_token) {
    return data.access_token
  }

  throw new Error(`Google authentication failed: ${
    JSON.stringify(data, null, 2)
  }`)
}
