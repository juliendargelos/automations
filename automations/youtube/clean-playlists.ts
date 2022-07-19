import { fetch } from '~/common/client.ts'
import { authenticate as googleAuthenticate } from '~/common/google.ts'
import { authenticate as youtubeAuthenticate } from '~/common/youtube.ts'
import { notify } from '~/common/chanify.ts'

import {
  YTDLP,
  PLAYLIST_ITEMS_ENDPOINT,
  VIDEOS_ENDPOINT,
  MUSIC_CATEGORY,
  MAX_ITEM_COUNT
} from '~/common/youtube.ts'

// https://www.youtube.com/playlist?list=

const UNAVAILABLE_PATTERN = /^\[(?:Deleted|Private) video\]$/

const PLAYLIST_IDS = {
  noises: 'PLKtcW8LnNHduc7f0vdGIhemtkkyTtZ70n',
  rekordbox: 'PLKtcW8LnNHdv7GhwhV5I5yS2qiOE5RZPX',
  listenLater: 'PLKtcW8LnNHdtMmcK0S5f1CUr9oo6ZRzcY'
  // noises: 'PLKtcW8LnNHdsGEiCg58Is_UK0f5d7iPrQ',
  // rekorbox: 'PLKtcW8LnNHdsGEiCg58Is_UK0f5d7iPrQ',
  // listenLater: 'PLKtcW8LnNHdu5OSdvD616bjyYI_rwnJTD'
}

const googleHeaders = {
  Authorization: `Bearer ${await googleAuthenticate()}`,
}

const ytdlpOptions = [
  ...(await youtubeAuthenticate())
 ]

const playlists = {}
const trash = []
let duplicates = 0
let unavailable = 0

console.log('Fetching youtube playlists...')

for (const name in PLAYLIST_IDS) {
  const id = PLAYLIST_IDS[name]
  const output = await Deno.makeTempFile()

  const ytdlp = Deno.run({ cmd: [YTDLP,
    ...ytdlpOptions,
    '--simulate',
    '--print-to-file', '%(id)s %(title)s', output,
    `https://www.youtube.com/playlist?list=${id}`
  ] })

  await ytdlp.status()

  playlists[name] = {
    id,
    name,
    videos: (await Deno.readTextFile(output))
      .split('\n')
      .filter(Boolean)
      .map(line => ({
        id: line.split(' ')[0],
        title: line.split(' ').slice(1).join(' ')
      }))
  }
}

// const playlists = (await Promise.all(Object
//   .entries(PLAYLIST_IDS)
//   .map(async ([name, id]) => {
//     const output = await Deno.makeTempFile()

//     const ytdlp = Deno.run({ cmd: [YTDLP,
//       '--simulate',
//       '--print-to-file', '%(id)s %(title)s', output,
//       `https://www.youtube.com/playlist?list=${id}`
//     ] })

//     await ytdlp.status()

//     return {
//       name,
//       id,
//       videos: (await Deno.readTextFile(output))
//         .split('\n')
//         .filter(Boolean)
//         .map(line => ({
//           id: line.split(' ')[0],
//           title: line.split(' ').slice(1).join(' ')
//         }))
//     }
//   })))
//   .reduce((playlists, playlist) => {
//     playlists[playlist.name] = playlist
//     return playlists
//   }, {})

console.log('Looking for unavailable videos...')

for (const playlistName in playlists) {
  const playlist = playlists[playlistName]
  for (const video of playlist.videos) {
    UNAVAILABLE_PATTERN.test(video.title) && trash.push({
      playlistId: playlist.id,
      videoId: video.id,
      reason: 'unavailable'
    })
  }
}

unavailable = trash.length

console.log(`Found ${unavailable} unavailable videos`)

console.log('Looking for duplicate videos...')

for (const video of playlists.listenLater.videos) {
  (
    playlists.noises.videos.some(({ id }) => video.id === id) ||
    playlists.rekordbox.videos.some(({ id }) => video.id === id)
  ) && trash.push({
    playlistId: playlists.listenLater.id,
    videoId: video.id,
    reason: 'duplicate'
  })
}

duplicates = trash.length - unavailable

console.log(`Found ${duplicates} duplicate videos`)

console.log(trash)

// console.log(`Removing ${trash.length} videos...`)

// for (const { playlistId, videoId, reason } of trash) {
//   const { items: playlistItems } = await fetch(PLAYLIST_ITEMS_ENDPOINT, {
//     headers: googleHeaders,
//     params: {
//       part: 'id',
//       playlistId,
//       videoId
//     }
//   })

//   for (const { id } of playlistItems) {
//     await fetch(PLAYLIST_ITEMS_ENDPOINT, {
//       method: 'delete',
//       headers: googleHeaders,
//       params: {
//         id: playlistItem.id
//       }
//     })
//   }

//   console.log(`Removed ${reason} video ${videoId} from playlist ${playlistId}`)
// }
