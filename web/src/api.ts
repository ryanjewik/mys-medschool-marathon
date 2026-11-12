// Same-origin calls: CloudFront routes /api/* to the Lambda and serves /config.json from S3.
import type { AppConfig, School } from "./types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`${options?.method ?? "GET"} ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const getConfig = () => request<AppConfig>("/config.json");

export const listSchools = () => request<School[]>("/api/schools");

export const setDone = (id: string, done: boolean) =>
  request<School>(`/api/schools/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ done }),
  });
