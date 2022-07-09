import { auth } from '@googleapis/oauth2'

export async function authenticate(): Promise<string> {
  const client = new auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  )

  client.setCredentials({ refresh_token: process.env.GOOGLE_TOKEN })

  const { token } = await client.getAccessToken()

  if (!token) {
    throw new Error('Unable to get google access token')
  }

  return token
}
