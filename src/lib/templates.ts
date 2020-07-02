import { FullUser } from 'twitter-d'
import { DBTweetProjectionInterface } from 'mongodb'

export const templates = {
  error (e: Error): string {
    return `Something went wrong...\n\n${e.message}`
  },
  tweetInfo (dbtweet: DBTweetProjectionInterface): string {
    const { tweet, created_at, added } = dbtweet
    const user = tweet.user as FullUser
    let message = `<a href="https://twitter.com/${user.screen_name}">&#160;</a>`
    message += `<b>Tweet ID:</b> <a href="https://twitter.com/${user.screen_name}/${tweet.id_str}">${tweet.id_str}</a>\n`
    message += `<b>Added to db:</b> ${new Date(created_at).toUTCString()}\n`
    message += `<b>Tweet created at:</b> ${new Date(tweet.created_at).toUTCString()}\n`
    message += `<b>User:</b> <a href="https://twitter.com/${user.screen_name}">${user.name}</a>\n`
    message += `<b>Added by user:</b> ${added ? 'Yes' : 'No'}`
    return message
  }
}
