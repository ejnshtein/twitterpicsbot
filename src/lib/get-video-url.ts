import { VideoInfo } from 'twitter-d/types/video_info'

export type VideoData = {
  video_url: string
  mime_type: string
}
export default function getVideoUrl (video_info: VideoInfo): VideoData {
  const { url, content_type } = video_info.variants
    .filter(({ content_type }) => content_type === 'video/mp4')
    .pop()

  return {
    video_url: url,
    mime_type: content_type
  }
}
