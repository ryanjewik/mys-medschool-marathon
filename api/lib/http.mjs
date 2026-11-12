// Response/request helpers for Lambda Function URL events (payload format 2.0).

export const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body),
});

// Throws on invalid JSON; returns undefined when there is no body.
export function parseJsonBody(event) {
  if (!event.body) return undefined;
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  return JSON.parse(raw);
}
