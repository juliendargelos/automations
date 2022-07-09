import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { OAuth2Client, Credentials } from 'google-auth-library'
import { auth } from '@googleapis/oauth2'
import { getToken } from './_supabase'

let authClient: OAuth2Client

export function getAuthClient(): OAuth2Client {
  if (!authClient) {
    authClient = new auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRETS,
      process.env.GOOGLE_REDIRECT_URL
    )
  }

  return authClient
}

export async function authenticate(): Promise<string | null> {
  const client = getAuthClient()
  const token = await getToken('google')

  if (token) {
    await client.setCredentials({ refresh_token: token })
    const result = await client.getAccessToken()

    if (result.token) {
      return result.token
    }
  }

  return null
}
