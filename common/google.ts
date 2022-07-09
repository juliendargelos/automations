import 'dotenv'
import { fetch } from '~/common/client.ts'

const OAUTH_TOKEN_ENDPOINT = 'https://accounts.google.com/o/oauth2/token'

export async function authenticate(): Promise<string> {
  const response = await fetch(OAUTH_TOKEN_ENDPOINT, {
    method: 'post',
    body: {
      client_id: Deno.env.get('GOOGLE_ID'),
      client_secret: Deno.env.get('GOOGLE_SECRET'),
      refresh_token: Deno.env.get('GOOGLE_TOKEN'),
      grant_type: 'refresh_token'
    }
  })

  const data = await response.json()

  if (data.access_token) {
    return data.access_token
  }

  throw new Error(`Google authentication failed: ${
    JSON.stringify(data, null, 2)
  }`)
}
