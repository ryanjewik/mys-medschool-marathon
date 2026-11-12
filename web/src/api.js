// Same-origin calls: CloudFront routes /api/* to the Lambda and serves /config.json from S3.

async function request(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`${options?.method ?? "GET"} ${path} failed: ${res.status}`);
  return res.json();
}

export const getConfig = () => request("/config.json");

export const listSchools = () => request("/api/schools");

export const setDone = (id, done) =>
  request(`/api/schools/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ done }),
  });
