import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TWEET_FIELDS, DEFAULT_TWEET_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult, errorResult } from "../api.js";
import { formatTweet } from "../format.js";

export function registerGetTweet(server: McpServer) {
  server.tool(
    "get_tweet",
    "Get a single tweet by its ID. Returns tweet text, author, metrics, and metadata.",
    {
      tweet_id: z
        .string()
        .min(1)
        .describe("The numeric ID of the tweet to look up"),
      tweet_fields: z
        .array(z.enum(TWEET_FIELDS))
        .optional()
        .describe("Optional list of tweet fields to return."),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ tweet_id, tweet_fields }) => {
      const selectedFields = tweet_fields ?? [...DEFAULT_TWEET_FIELDS];
      const result = await xApiFetch(`tweets/${encodeURIComponent(tweet_id)}`, {
        "tweet.fields": selectedFields.join(","),
        expansions: "author_id",
        "user.fields": "name,username,verified,verified_type",
      });

      if (isError(result)) return result;

      if (!result.data) {
        return errorResult(`Tweet ${tweet_id} not found.`);
      }

      return successResult(
        formatTweet(result.data, result.json.includes),
        result.json
      );
    }
  );
}
