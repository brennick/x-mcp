import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { USER_FIELDS, DEFAULT_USER_FIELDS, READ_ONLY_ANNOTATIONS } from "../fields.js";
import { xApiFetch, isError, successResult } from "../api.js";
import { formatUser } from "../format.js";

export function registerLookupUser(server: McpServer) {
  server.tool(
    "lookup_user",
    "Look up an X (Twitter) user by their username. Returns profile information including name, bio, metrics, and more.",
    {
      username: z
        .string()
        .min(1)
        .max(15)
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username must contain only letters, numbers, and underscores"
        )
        .describe("The X username to look up (without the @ symbol)"),
      fields: z
        .array(z.enum(USER_FIELDS))
        .optional()
        .describe(
          "Optional list of user fields to return. Defaults to a useful subset."
        ),
    },
    READ_ONLY_ANNOTATIONS,
    async ({ username, fields }) => {
      const selectedFields = fields ?? [...DEFAULT_USER_FIELDS];
      const result = await xApiFetch(
        `users/by/username/${encodeURIComponent(username)}`,
        { "user.fields": selectedFields.join(",") }
      );

      if (isError(result)) return result;

      if (!result.data) {
        return {
          content: [{ type: "text" as const, text: `User @${username} not found.` }],
          isError: true,
        };
      }

      return successResult(formatUser(result.data), result.json);
    }
  );
}
