import { Status } from 'twitter-d'

export default function filterMedia (tweets: Status[]): [Status[], Status[]] {
  const photosAndVideos = []
  const other = []
  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i]
    if (tweet.extended_entities.media.every(({ type }) => ['photo', 'video'].includes(type))) {
      photosAndVideos.push(tweet)
    } else {
      other.push(tweet)
    }
  }
  return [photosAndVideos, other]
}
