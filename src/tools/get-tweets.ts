import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TWEET_FIELDS, DEFAULT_TWEET_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult, errorResult } from "../api.js";
import { formatTweets } from "../format.js";

export function registerGetTweets(server: McpServer) {
  server.tool(
    "get_tweets",
    "Get multiple tweets by their IDs (up to 100). Returns tweet text, authors, metrics, and metadata.",
    {
      tweet_ids: z
        .array(z.string().min(1))
        .min(1)
        .max(100)
        .describe("Array of tweet IDs to look up (max 100)"),
      tweet_fields: z
        .array(z.enum(TWEET_FIELDS))
        .optional()
        .describe("Optional list of tweet fields to return."),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ tweet_ids, tweet_fields }) => {
      const selectedFields = tweet_fields ?? [...DEFAULT_TWEET_FIELDS];
      const result = await xApiFetch("tweets", {
        ids: tweet_ids.join(","),
        "tweet.fields": selectedFields.join(","),
        expansions: "author_id",
        "user.fields": "name,username,verified,verified_type",
      });

      if (isError(result)) return result;

      if (!result.data || !(result.data as unknown[]).length) {
        return errorResult("No tweets found for the given IDs.");
      }

      return successResult(
        formatTweets(result.data as unknown[], result.json.includes),
        result.json
      );
    }
  );
}
