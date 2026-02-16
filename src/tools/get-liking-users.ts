import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { USER_FIELDS, DEFAULT_USER_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult } from "../api.js";
import { formatUsers } from "../format.js";

export function registerGetLikingUsers(server: McpServer) {
  server.tool(
    "get_liking_users",
    "Get a list of users who liked a specific tweet.",
    {
      tweet_id: z
        .string()
        .min(1)
        .describe("The numeric ID of the tweet"),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of users to return (1-100, default 100)"),
      user_fields: z
        .array(z.enum(USER_FIELDS))
        .optional()
        .describe("Optional list of user fields to return."),
      pagination_token: z
        .string()
        .optional()
        .describe("Token for the next page of results (from a previous response's next_token)."),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ tweet_id, max_results, user_fields, pagination_token }) => {
      const selectedFields = user_fields ?? [...DEFAULT_USER_FIELDS];
      const params: Record<string, string> = {
        max_results: String(max_results ?? 100),
        "user.fields": selectedFields.join(","),
      };
      if (pagination_token) params.pagination_token = pagination_token;
      const result = await xApiFetch(
        `tweets/${encodeURIComponent(tweet_id)}/liking_users`,
        params
      );

      if (isError(result)) return result;

      if (!result.data || !(result.data as unknown[]).length) {
        return successResult("No liking users found.", result.json);
      }

      const nextToken = (result.json.meta as any)?.next_token as string | undefined;
      return successResult(
        formatUsers(result.data as unknown[]),
        result.json,
        nextToken
      );
    }
  );
}
