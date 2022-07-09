import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async (request: VercelRequest, response: VercelResponse) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  )

  const { data, error } = await supabase
    .from('tokens')
    .select()
    .eq('service', 'youtube')
    .limit(1)

  const [{ token = null } = {}] = data || []

  if (error || !token) {
    response.send('not found')
  } else {
    response.send(token.test)
  }
}
