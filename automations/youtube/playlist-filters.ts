import { fetch } from '~/common/client.ts'
import { authenticate } from '~/common/google.ts'
import { notify } from '~/common/chanify.ts'

import {
  PLAYLIST_ITEMS_ENDPOINT,
  VIDEOS_ENDPOINT,
  MUSIC_CATEGORY
} from '~/common/youtube.ts'

// Api units used per run:
// minimum: 20
// maximum: 1020

const ITEMS_COUNT = 10
const WATCH_LATER_PLAYLIST_ID = 'PLKtcW8LnNHdu12KfpHUJINe0FnLLFVoVD'
const LISTEN_LATER_PLAYLIST_ID = 'PLKtcW8LnNHdtMmcK0S5f1CUr9oo6ZRzcY'

const headers = {
  Authorization: `Bearer ${await authenticate()}`,
}

console.log(
  `Fetching last ${ITEMS_COUNT} youtube videos of watch later playlist...`
)

const { items: playlistItems } = await fetch(PLAYLIST_ITEMS_ENDPOINT, {
  headers,
  params: {
    part: 'snippet',
    maxResults: ITEMS_COUNT,
    playlistId: WATCH_LATER_PLAYLIST_ID
  }
})

const { items: videos } = await fetch(VIDEOS_ENDPOINT, {
  headers,
  params: {
    part: 'snippet',
    id: playlistItems
      .map((item: any) => item.snippet.resourceId.videoId)
      .join(','),
  }
})

console.log('Filtering videos...')

const { length: count } = await Promise.all(videos
  .filter((video: any) => ((
    // filter videos that are in the music category
    video.snippet.categoryId === MUSIC_CATEGORY &&

    // filter videos with titles that does look like song titles
    /\b(?: - |feat\.|edit|remix|mix|single|album|ep)\b/i.test(video.snippet.title)
  ) || (
    /\b(?:remix|full album|original mix|extended mix|full mix|acid mix)\b/i.test(video.snippet.title)
  )))
  .map((video: any, index: number) => Promise.all([
    // remove video from watch later
    fetch(PLAYLIST_ITEMS_ENDPOINT, {
      headers,
      method: 'delete',
      params: {
        id: playlistItems[index].id
      }
    }),

    // add video to listen later
    fetch(PLAYLIST_ITEMS_ENDPOINT, {
      headers,
      method: 'post',
      params: {
        part: 'snippet'
      },
      body: {
        snippet: {
          playlistId: LISTEN_LATER_PLAYLIST_ID,
          resourceId: {
            kind: 'youtube#video',
            videoId: video.id
          }
        }
      }
    }),
  ]))
)

const message = `${count} youtube video${count > 1
  ? 's have'
  : ' has'
} been moved to listen later playlist`

console.log(message)

await count && notify(message)
