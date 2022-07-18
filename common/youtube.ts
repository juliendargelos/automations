export const YTDLP = new URL('../bin/yt-dlp', import.meta.url).pathname
export const API_URL = 'https://www.googleapis.com/youtube/v3'
export const VIDEOS_ENDPOINT = `${API_URL}/videos`
export const PLAYLIST_ITEMS_ENDPOINT = `${API_URL}/playlistItems`

export const MAX_ITEM_COUNT = 50
export const MUSIC_CATEGORY = '10'

export async function ytdlp(...args: string): Promise<string> {
  const process = Deno.run({
    cmd: [YTDLP, ...args],
    // stdout: 'piped',
    // stderr: 'piped'
  })

  const { code } = await process.status()

  if (code !== 0) {
    throw new Error(await process.stderrOutput())
  }

  return new TextDecoder().decode(await process.output())
}
