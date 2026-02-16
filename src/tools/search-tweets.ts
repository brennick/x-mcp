import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TWEET_FIELDS, DEFAULT_TWEET_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult } from "../api.js";
import { formatTweets } from "../format.js";

export function registerSearchTweets(server: McpServer) {
  server.tool(
    "search_tweets",
    "Search recent tweets (last 7 days) using the X search query syntax. Supports operators like from:, to:, is:retweet, has:media, lang:, etc.",
    {
      query: z
        .string()
        .min(1)
        .max(512)
        .describe("Search query (max 512 chars). Supports X search operators."),
      max_results: z
        .number()
        .int()
        .min(10)
        .max(100)
        .optional()
        .describe("Number of results to return (10-100, default 10)"),
      tweet_fields: z
        .array(z.enum(TWEET_FIELDS))
        .optional()
        .describe("Optional list of tweet fields to return."),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ query, max_results, tweet_fields }) => {
      const selectedFields = tweet_fields ?? [...DEFAULT_TWEET_FIELDS];
      const result = await xApiFetch("tweets/search/recent", {
        query,
        max_results: String(max_results ?? 10),
        "tweet.fields": selectedFields.join(","),
        expansions: "author_id",
        "user.fields": "name,username,verified,verified_type",
      });

      if (isError(result)) return result;

      if (!result.data || !(result.data as unknown[]).length) {
        return successResult("No tweets found matching the query.", result.json);
      }

      return successResult(
        formatTweets(result.data as unknown[], result.json.includes),
        result.json
      );
    }
  );
}
