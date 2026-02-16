import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerLookupUser } from "./tools/lookup-user.js";
import { registerGetTweet } from "./tools/get-tweet.js";
import { registerGetTweets } from "./tools/get-tweets.js";
import { registerSearchTweets } from "./tools/search-tweets.js";
import { registerGetUserTweets } from "./tools/get-user-tweets.js";
import { registerGetFollowers } from "./tools/get-followers.js";
import { registerGetFollowing } from "./tools/get-following.js";
import { registerGetLikingUsers } from "./tools/get-liking-users.js";
import { registerGetRetweeters } from "./tools/get-retweeters.js";
import { registerGetListTweets } from "./tools/get-list-tweets.js";

const server = new McpServer({
  name: "x-mcp",
  version: "1.0.0",
});

registerLookupUser(server);
registerGetTweet(server);
registerGetTweets(server);
registerSearchTweets(server);
registerGetUserTweets(server);
registerGetFollowers(server);
registerGetFollowing(server);
registerGetLikingUsers(server);
registerGetRetweeters(server);
registerGetListTweets(server);

async function main() {
  const transport = new StdioServerTransport();
  console.error("x-mcp: starting server...");
  await server.connect(transport);
  console.error("x-mcp: server running on stdio");
}

main().catch((err) => {
  console.error("x-mcp: fatal error:", err);
  process.exit(1);
});
