import { authenticate } from '~/common/google.ts'

const token = await authenticate()

console.log('hey')

// const { items: playlistItems } = await require("@pipedreamhq/platform").axios(this, {
//   url: 'https://www.googleapis.com/youtube/v3/playlistItems',
//   params: {
//     part: 'snippet',
//     maxResults: 10,
//     playlistId: 'PLKtcW8LnNHdu12KfpHUJINe0FnLLFVoVD',
//   },
//   headers: {
//     Authorization: `Bearer ${auths.youtube_data_api.oauth_access_token}`,
//   },
// })

// const { items: videos } = await require("@pipedreamhq/platform").axios(this, {
//   url: 'https://youtube.googleapis.com/youtube/v3/videos',
//   params: {
//     part: 'snippet',
//     id: playlistItems.map(item => item.snippet.resourceId.videoId).join(','),
//   },
//   headers: {
//     Authorization: `Bearer ${auths.youtube_data_api.oauth_access_token}`,
//   },
// })

// const movedVideos = []

// for (let index = 0; index < videos.length; index++) {
//   const playlistItem = playlistItems[index]
//   const video = videos[index]

//   if (
//     // ignore videos that are not in the music category
//     video.snippet.categoryId !== '10' ||

//     // ignore videos with titles that does not look like song titles
//     !/(?: - |feat\.|edit|single|album|ep)/i.test(video.snippet.title)
//   ) {
//     continue
//   }

//   await require("@pipedreamhq/platform").axios(this, {
//     method: 'post',
//     url: 'https://youtube.googleapis.com/youtube/v3/playlistItems',
//     params: {
//       part: 'snippet'
//     },
//     data: {
//       snippet: {
//         playlistId: 'PLKtcW8LnNHdtMmcK0S5f1CUr9oo6ZRzcY',
//         resourceId: {
//           kind: 'youtube#video',
//           videoId: video.id,
//         },
//       },
//     },
//     headers: {
//       Authorization: `Bearer ${auths.youtube_data_api.oauth_access_token}`,
//     },
//   })

//   await require("@pipedreamhq/platform").axios(this, {
//     method: 'delete',
//     url: 'https://youtube.googleapis.com/youtube/v3/playlistItems',
//     params: {
//       id: playlistItem.id
//     },
//     headers: {
//       Authorization: `Bearer ${auths.youtube_data_api.oauth_access_token}`,
//     },
//   })

//   movedVideos.push(video)
// }
