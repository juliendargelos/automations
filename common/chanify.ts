import 'dotenv'
import { fetch, searchParams } from '~/common/client.ts'

export const API_URL = 'https://api.chanify.net/v1/sender'
export const API_ENDPOINT = `${API_URL}/${Deno.env.get('CHANIFY_TOKEN')}`

export async function notify(text: string): Promise<void> {
  await fetch(API_ENDPOINT, {
    method: 'post',
    body: searchParams({ text })
  })
}
