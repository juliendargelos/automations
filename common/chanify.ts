import 'dotenv'
import { fetch, searchParams } from '~/common/client.ts'

export const API_URL = 'https://api.chanify.net/v1'
export const SENDER_ENDPOINT = `${API_URL}/sender/${Deno.env.get('CHANIFY_TOKEN')}`

export async function notify(parameters: {
  title?: string
  text?: string
  copy?: string
  interruptionlevel?: 'active' | 'passive' | 'time-sensitive'
  autocopy?: boolean
  sound?: boolean
} = {}): Promise<void> {
  await fetch(SENDER_ENDPOINT, {
    method: 'post',
    body: {
      ...parameters,
      autocopy: (parameters.autocopy as unknown as number) * 1,
      sound: (parameters.sound as unknown as number) * 1
    }
  })
}
