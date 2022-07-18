export const YTDLP = new URL('../bin/yt-dlp', import.meta.url).pathname
export const API_URL = 'https://www.googleapis.com/youtube/v3'
export const VIDEOS_ENDPOINT = `${API_URL}/videos`
export const PLAYLIST_ITEMS_ENDPOINT = `${API_URL}/playlistItems`

export const MAX_ITEM_COUNT = 50
export const MUSIC_CATEGORY = '10'

export async function authenticate(): Promise<string> {
  if (Deno.env.get('YOUTUBE_COOKIES')) {
    const cookies = await Deno.makeTempFile()
    await fs.writeTextFile(cookies, Deno.env.get('YOUTUBE_COOKIES'))
    return ['--cookies', cookies]
  } else {
    return []
  }
}
