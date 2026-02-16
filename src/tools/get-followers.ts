import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { USER_FIELDS, DEFAULT_USER_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult } from "../api.js";
import { formatUsers } from "../format.js";

export function registerGetFollowers(server: McpServer) {
  server.tool(
    "get_followers",
    "Get a list of users who follow the specified user. Requires the user's numeric ID — use lookup_user first to get the ID from a username.",
    {
      user_id: z
        .string()
        .min(1)
        .describe("The numeric user ID. Use lookup_user to get this from a username."),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe("Number of followers to return (1-1000, default 100)"),
      user_fields: z
        .array(z.enum(USER_FIELDS))
        .optional()
        .describe("Optional list of user fields to return."),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ user_id, max_results, user_fields }) => {
      const selectedFields = user_fields ?? [...DEFAULT_USER_FIELDS];
      const result = await xApiFetch(
        `users/${encodeURIComponent(user_id)}/followers`,
        {
          max_results: String(max_results ?? 100),
          "user.fields": selectedFields.join(","),
        }
      );

      if (isError(result)) return result;

      if (!result.data || !(result.data as unknown[]).length) {
        return successResult("No followers found.", result.json);
      }

      return successResult(
        formatUsers(result.data as unknown[]),
        result.json
      );
    }
  );
}
