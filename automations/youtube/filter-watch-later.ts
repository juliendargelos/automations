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

let index: number
let video: any
let playlistItem: any
let count: number = 0

for (let index = 0; index < videos.length; index++) {
  video = videos[index]
  playlistItem = playlistItems[index]

  if ((
    // ignore videos that are not in the music category
    !video.snippet.categoryId === MUSIC_CATEGORY // ||

    // ignore videos with titles that does not look like song titles
    // !/\b(?: - |feat\.|edit|remix|mix|single|album|ep)\b/i
    //   .test(video.snippet.title)
  ) && (
    // include any video with title strongly suggesting it is a song
    !/\b(?:remix|full album|original mix|extended mix|full mix|acid mix|single|ep|feat\.)\b/i
      .test(video.snippet.title)
  )) {
    continue
  }

  await fetch(PLAYLIST_ITEMS_ENDPOINT, {
    headers,
    unwrap: false,
    method: 'delete',
    params: {
      id: playlistItems[index].id
    }
  })

  await fetch(PLAYLIST_ITEMS_ENDPOINT, {
    headers,
    unwrap: false,
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
  })

  count++
}

const message = `${count} youtube video${count > 1
  ? 's have'
  : ' has'
} been moved to listen later playlist`

console.log(message)

await count && notify({
  title: 'Playlist filters',
  text: message
})
