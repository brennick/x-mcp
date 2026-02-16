import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TWEET_FIELDS, DEFAULT_TWEET_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult } from "../api.js";
import { formatTweets } from "../format.js";

export function registerGetUserTweets(server: McpServer) {
  server.tool(
    "get_user_tweets",
    "Get recent tweets by a user. Requires the user's numeric ID — use lookup_user first to get the ID from a username.",
    {
      user_id: z
        .string()
        .min(1)
        .describe("The numeric user ID. Use lookup_user to get this from a username."),
      max_results: z
        .number()
        .int()
        .min(5)
        .max(100)
        .optional()
        .describe("Number of tweets to return (5-100, default 10)"),
      tweet_fields: z
        .array(z.enum(TWEET_FIELDS))
        .optional()
        .describe("Optional list of tweet fields to return."),
      pagination_token: z
        .string()
        .optional()
        .describe("Token for the next page of results (from a previous response's next_token)."),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ user_id, max_results, tweet_fields, pagination_token }) => {
      const selectedFields = tweet_fields ?? [...DEFAULT_TWEET_FIELDS];
      const params: Record<string, string> = {
        max_results: String(max_results ?? 10),
        "tweet.fields": selectedFields.join(","),
        expansions: "author_id",
        "user.fields": "name,username,verified,verified_type",
      };
      if (pagination_token) params.pagination_token = pagination_token;
      const result = await xApiFetch(
        `users/${encodeURIComponent(user_id)}/tweets`,
        params
      );

      if (isError(result)) return result;

      if (!result.data || !(result.data as unknown[]).length) {
        return successResult("No tweets found for this user.", result.json);
      }

      const nextToken = (result.json.meta as any)?.next_token as string | undefined;
      return successResult(
        formatTweets(result.data as unknown[], result.json.includes),
        result.json,
        nextToken
      );
    }
  );
}
