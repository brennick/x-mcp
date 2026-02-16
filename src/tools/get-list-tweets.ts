import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TWEET_FIELDS, DEFAULT_TWEET_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult } from "../api.js";
import { formatTweets } from "../format.js";

export function registerGetListTweets(server: McpServer) {
  server.tool(
    "get_list_tweets",
    "Get recent tweets from an X List by list ID.",
    {
      list_id: z
        .string()
        .min(1)
        .describe("The numeric ID of the X List"),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of tweets to return (1-100, default 100)"),
      tweet_fields: z
        .array(z.enum(TWEET_FIELDS))
        .optional()
        .describe("Optional list of tweet fields to return."),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ list_id, max_results, tweet_fields }) => {
      const selectedFields = tweet_fields ?? [...DEFAULT_TWEET_FIELDS];
      const result = await xApiFetch(
        `lists/${encodeURIComponent(list_id)}/tweets`,
        {
          max_results: String(max_results ?? 100),
          "tweet.fields": selectedFields.join(","),
          expansions: "author_id",
          "user.fields": "name,username,verified,verified_type",
        }
      );

      if (isError(result)) return result;

      if (!result.data || !(result.data as unknown[]).length) {
        return successResult("No tweets found in this list.", result.json);
      }

      return successResult(
        formatTweets(result.data as unknown[], result.json.includes),
        result.json
      );
    }
  );
}
