import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const USER_FIELDS = [
  "created_at",
  "description",
  "entities",
  "id",
  "location",
  "most_recent_tweet_id",
  "name",
  "pinned_tweet_id",
  "profile_image_url",
  "protected",
  "public_metrics",
  "url",
  "username",
  "verified",
  "verified_type",
  "withheld",
] as const;

const DEFAULT_FIELDS: readonly (typeof USER_FIELDS)[number][] = [
  "created_at",
  "description",
  "id",
  "location",
  "name",
  "profile_image_url",
  "public_metrics",
  "url",
  "username",
  "verified",
  "verified_type",
];

const server = new McpServer({
  name: "x-mcp",
  version: "1.0.0",
});

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
  {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
  async ({ username, fields }) => {
    const token = process.env.X_BEARER_TOKEN;
    if (!token) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: X_BEARER_TOKEN environment variable is not set. Please configure it with your X API Bearer Token.",
          },
        ],
        isError: true,
      };
    }

    const selectedFields = fields ?? [...DEFAULT_FIELDS];
    const url = `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=${selectedFields.join(",")}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Network error: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
        isError: true,
      };
    }

    if (!response.ok) {
      const body = await response.text();
      return {
        content: [
          {
            type: "text" as const,
            text: `X API error (HTTP ${response.status}): ${body}`,
          },
        ],
        isError: true,
      };
    }

    const json = await response.json();

    if (json.errors) {
      const errorMessages = json.errors
        .map((e: { detail?: string; title?: string }) => e.detail ?? e.title ?? "Unknown error")
        .join("; ");
      return {
        content: [
          {
            type: "text" as const,
            text: `X API returned errors: ${errorMessages}`,
          },
        ],
        isError: true,
      };
    }

    if (!json.data) {
      return {
        content: [
          {
            type: "text" as const,
            text: `User @${username} not found.`,
          },
        ],
        isError: true,
      };
    }

    const user = json.data;
    const lines: string[] = [];

    lines.push(`@${user.username} — ${user.name}`);
    if (user.verified_type) lines.push(`Verified: ${user.verified_type}`);
    else if (user.verified) lines.push("Verified: yes");
    if (user.description) lines.push(`Bio: ${user.description}`);
    if (user.location) lines.push(`Location: ${user.location}`);
    if (user.url) lines.push(`URL: ${user.url}`);
    if (user.created_at) lines.push(`Joined: ${user.created_at}`);
    if (user.profile_image_url) lines.push(`Avatar: ${user.profile_image_url}`);
    if (user.public_metrics) {
      const m = user.public_metrics;
      lines.push(
        `Followers: ${m.followers_count} | Following: ${m.following_count} | Tweets: ${m.tweet_count} | Listed: ${m.listed_count}`
      );
    }
    lines.push(`ID: ${user.id}`);

    const formatted = lines.join("\n");
    const raw = JSON.stringify(json, null, 2);

    return {
      content: [
        { type: "text" as const, text: formatted },
        { type: "text" as const, text: `\n---\nRaw JSON:\n${raw}` },
      ],
    };
  }
);

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
