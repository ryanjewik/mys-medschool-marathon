// Same-origin calls: CloudFront routes /api/* to the Lambda and serves /config.json from S3.
import type { AppConfig, School } from "./types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`${options?.method ?? "GET"} ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const getConfig = () => request<AppConfig>("/config.json");

export const listSchools = () => request<School[]>("/api/schools");

// CloudFront signs requests to the Lambda (origin access control), and for one with a body
// AWS needs the body's SHA-256 from the browser in this header, or it rejects the request.
async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function setDone(id: string, done: boolean): Promise<School> {
  const body = JSON.stringify({ done });
  return request<School>(`/api/schools/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json", "x-amz-content-sha256": await sha256Hex(body) },
    body,
  });
}
