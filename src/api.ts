import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function errorResult(message: string): CallToolResult {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

export function successResult(formatted: string, json: unknown, nextToken?: string): CallToolResult {
  const parts = [
    { type: "text" as const, text: formatted },
    { type: "text" as const, text: `\n---\nRaw JSON:\n${JSON.stringify(json, null, 2)}` },
  ];
  if (nextToken) {
    parts.splice(1, 0, {
      type: "text" as const,
      text: `\n---\nNext page token: ${nextToken}`,
    });
  }
  return { content: parts };
}

type FetchSuccess = { data: unknown; json: Record<string, unknown> };

export function isError(result: FetchSuccess | CallToolResult): result is CallToolResult {
  return "content" in result && !("data" in result);
}

export async function xApiFetch(
  path: string,
  params?: Record<string, string>
): Promise<FetchSuccess | CallToolResult> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    return errorResult(
      "Error: X_BEARER_TOKEN environment variable is not set. Please configure it with your X API Bearer Token."
    );
  }

  const url = new URL(`https://api.x.com/2/${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    return errorResult(
      `Network error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!response.ok) {
    const body = await response.text();
    return errorResult(`X API error (HTTP ${response.status}): ${body}`);
  }

  const json = await response.json();

  if (json.errors) {
    const errorMessages = json.errors
      .map((e: { detail?: string; title?: string }) => e.detail ?? e.title ?? "Unknown error")
      .join("; ");
    return errorResult(`X API returned errors: ${errorMessages}`);
  }

  return { data: json.data, json };
}
