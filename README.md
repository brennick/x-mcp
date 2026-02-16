# x-mcp

An MCP server that provides read-only access to the X (Twitter) API v2.

> **MCP Server** — works with Claude Desktop and any MCP-compatible client.

## Tools

| Tool | Description |
|------|-------------|
| `lookup_user` | Look up a user profile by username |
| `get_tweet` | Get a single tweet by ID |
| `get_tweets` | Get multiple tweets by ID (up to 100) |
| `search_tweets` | Search recent tweets (last 7 days) |
| `get_user_tweets` | Get recent tweets by a user |
| `get_followers` | Get a user's followers |
| `get_following` | Get accounts a user follows |
| `get_liking_users` | Get users who liked a tweet |
| `get_retweeters` | Get users who retweeted a tweet |
| `get_list_tweets` | Get recent tweets from an X List |

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- An X API Bearer Token — create one at the [X Developer Portal](https://developer.x.com/en/portal/dashboard)

## Setup

```bash
git clone https://github.com/brennick/x-mcp.git
cd x-mcp
npm install
npm run build
```

Create a `.env` file (or set the environment variable directly):

```
X_BEARER_TOKEN=your_x_api_bearer_token_here
```

## Usage with Claude

Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "x-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/x-mcp/build/index.js"],
      "env": {
        "X_BEARER_TOKEN": "your_x_api_bearer_token_here"
      }
    }
  }
}
```

Replace `/absolute/path/to/x-mcp` with the actual path where you cloned the repo.

## Example Queries

Once connected, you can ask Claude things like:

**User Info**
- "Look up the profile for @elonmusk"
- "What's the bio and follower count for @anthropic?"

**Tweets**
- "Get the tweet with ID 1234567890"
- "Show me the last 20 tweets from @openai"

**Search**
- "Search for recent tweets about 'large language models'"
- "Find tweets from @ycombinator mentioning AI"

**Social Graph**
- "Who are the first 50 followers of @github?"
- "Who does @vercel follow?"

**Engagement**
- "Who liked this tweet? [tweet ID]"
- "Show me who retweeted this tweet [tweet ID]"

**Lists**
- "Get the latest tweets from list 1234567890"

## Available Tools Reference

### `lookup_user`

Look up an X user by their username. Returns profile information including name, bio, metrics, and more.

- **Parameters:**
  - `username` (string, required) — The X username to look up (without the @ symbol)
  - `fields` (array, optional) — User fields to return. Defaults to a useful subset.
- **Endpoint:** `GET /2/users/by/username/{username}`

### `get_tweet`

Get a single tweet by its ID. Returns tweet text, author, metrics, and metadata.

- **Parameters:**
  - `tweet_id` (string, required) — The numeric ID of the tweet
  - `tweet_fields` (array, optional) — Tweet fields to return
- **Endpoint:** `GET /2/tweets/{tweet_id}`

### `get_tweets`

Get multiple tweets by their IDs (up to 100). Returns tweet text, authors, metrics, and metadata.

- **Parameters:**
  - `tweet_ids` (array of strings, required) — Array of tweet IDs (1–100)
  - `tweet_fields` (array, optional) — Tweet fields to return
- **Endpoint:** `GET /2/tweets`

### `search_tweets`

Search recent tweets (last 7 days) using X search query syntax. Supports operators like `from:`, `to:`, `is:retweet`, `has:media`, `lang:`, etc.

- **Parameters:**
  - `query` (string, required) — Search query (max 512 characters)
  - `max_results` (number, optional) — Results to return (10–100, default 10)
  - `tweet_fields` (array, optional) — Tweet fields to return
  - `pagination_token` (string, optional) — Token for the next page of results
- **Endpoint:** `GET /2/tweets/search/recent`

### `get_user_tweets`

Get recent tweets by a user. Requires the user's numeric ID — use `lookup_user` first to get the ID from a username.

- **Parameters:**
  - `user_id` (string, required) — The numeric user ID
  - `max_results` (number, optional) — Tweets to return (5–100, default 10)
  - `tweet_fields` (array, optional) — Tweet fields to return
  - `pagination_token` (string, optional) — Token for the next page of results
- **Endpoint:** `GET /2/users/{user_id}/tweets`

### `get_followers`

Get a list of users who follow the specified user. Requires the user's numeric ID.

- **Parameters:**
  - `user_id` (string, required) — The numeric user ID
  - `max_results` (number, optional) — Followers to return (1–1000, default 100)
  - `user_fields` (array, optional) — User fields to return
  - `pagination_token` (string, optional) — Token for the next page of results
- **Endpoint:** `GET /2/users/{user_id}/followers`

### `get_following`

Get a list of users the specified user is following. Requires the user's numeric ID.

- **Parameters:**
  - `user_id` (string, required) — The numeric user ID
  - `max_results` (number, optional) — Accounts to return (1–1000, default 100)
  - `user_fields` (array, optional) — User fields to return
  - `pagination_token` (string, optional) — Token for the next page of results
- **Endpoint:** `GET /2/users/{user_id}/following`

### `get_liking_users`

Get a list of users who liked a specific tweet.

- **Parameters:**
  - `tweet_id` (string, required) — The numeric tweet ID
  - `max_results` (number, optional) — Users to return (1–100, default 100)
  - `user_fields` (array, optional) — User fields to return
  - `pagination_token` (string, optional) — Token for the next page of results
- **Endpoint:** `GET /2/tweets/{tweet_id}/liking_users`

### `get_retweeters`

Get a list of users who retweeted a specific tweet.

- **Parameters:**
  - `tweet_id` (string, required) — The numeric tweet ID
  - `max_results` (number, optional) — Users to return (1–100, default 100)
  - `user_fields` (array, optional) — User fields to return
  - `pagination_token` (string, optional) — Token for the next page of results
- **Endpoint:** `GET /2/tweets/{tweet_id}/retweeted_by`

### `get_list_tweets`

Get recent tweets from an X List by list ID.

- **Parameters:**
  - `list_id` (string, required) — The numeric list ID
  - `max_results` (number, optional) — Tweets to return (1–100, default 100)
  - `tweet_fields` (array, optional) — Tweet fields to return
  - `pagination_token` (string, optional) — Token for the next page of results
- **Endpoint:** `GET /2/lists/{list_id}/tweets`

## Project Structure

```
src/
├── index.ts          # Server entry point — registers all tools
├── api.ts            # X API fetch, auth, and error handling
├── fields.ts         # Field definitions and defaults for users/tweets
├── format.ts         # Text formatting for user and tweet results
└── tools/
    ├── lookup-user.ts
    ├── get-tweet.ts
    ├── get-tweets.ts
    ├── search-tweets.ts
    ├── get-user-tweets.ts
    ├── get-followers.ts
    ├── get-following.ts
    ├── get-liking-users.ts
    ├── get-retweeters.ts
    └── get-list-tweets.ts
```

## License

[MIT](LICENSE)
