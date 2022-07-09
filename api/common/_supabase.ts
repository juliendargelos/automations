import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    )
  }

  return supabase
}

export async function getToken(service: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('tokens')
    .select()
    .match({ service })
    .limit(1)

  if (error)  {
    throw error
  }

  return data && data[0] ? data[0] : null
}

export async function setToken(service: string, token: string): Promise<void> {
  const tokens = getSupabase().from('tokens')

  const { count, error: getError } = await tokens
    .select('service', { count: 'exact', head: true })
    .match({ service })
    .limit(1)

  if (getError)  {
    throw getError
  }

  const { error: setError } = await (count
    ? tokens.update({ token }).match({ service })
    : tokens.insert({ service, token })
  )

  if (setError)  {
    throw setError
  }
}
