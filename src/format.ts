/* eslint-disable @typescript-eslint/no-explicit-any */

export function formatUser(user: any): string {
  const lines: string[] = [];

  lines.push(`@${user.username} — ${user.name}`);
  if (user.verified_type) lines.push(`Verified: ${user.verified_type}`);
  else if (user.verified) lines.push("Verified: yes");
  if (user.description) lines.push(`Bio: ${user.description}`);
  if (user.location) lines.push(`Location: ${user.location}`);
  if (user.url) lines.push(`URL: ${user.url}`);
  if (user.created_at) lines.push(`Joined: ${user.created_at}`);
  if (user.profile_image_url) lines.push(`Avatar: ${user.profile_image_url}`);
  if (user.public_metrics) {
    const m = user.public_metrics;
    lines.push(
      `Followers: ${m.followers_count} | Following: ${m.following_count} | Tweets: ${m.tweet_count} | Listed: ${m.listed_count}`
    );
  }
  lines.push(`ID: ${user.id}`);

  return lines.join("\n");
}

export function formatTweet(tweet: any, includes?: any): string {
  const lines: string[] = [];

  if (tweet.author_id && includes?.users) {
    const author = includes.users.find((u: any) => u.id === tweet.author_id);
    if (author) lines.push(`@${author.username} (${author.name})`);
  }

  if (tweet.text) lines.push(tweet.text);
  if (tweet.created_at) lines.push(`Posted: ${tweet.created_at}`);

  if (tweet.referenced_tweets?.length) {
    const refs = tweet.referenced_tweets
      .map((r: any) => `${r.type}: ${r.id}`)
      .join(", ");
    lines.push(`References: ${refs}`);
  }

  if (tweet.public_metrics) {
    const m = tweet.public_metrics;
    lines.push(
      `Likes: ${m.like_count} | Retweets: ${m.retweet_count} | Replies: ${m.reply_count} | Quotes: ${m.quote_count}`
    );
  }

  lines.push(`Tweet ID: ${tweet.id}`);
  if (tweet.conversation_id) lines.push(`Conversation ID: ${tweet.conversation_id}`);

  return lines.join("\n");
}

export function formatUsers(users: any[]): string {
  return users.map(formatUser).join("\n\n");
}

export function formatTweets(tweets: any[], includes?: any): string {
  return tweets.map((t) => formatTweet(t, includes)).join("\n\n---\n\n");
}
