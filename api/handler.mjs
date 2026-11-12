// Lambda entry point (handler = "handler.handler"). Reached via CloudFront at /api/*.
// Matches method + path to an endpoint file; each endpoint returns an HTTP response object.
import { listSchools } from "./endpoints/list-schools.mjs";
import { updateSchool } from "./endpoints/update-school.mjs";
import { json } from "./lib/http.mjs";

const routes = [
  { method: "GET", path: /^\/api\/schools$/, run: listSchools },
  { method: "PUT", path: /^\/api\/schools\/(?<id>[\w-]+)$/, run: updateSchool },
];

export const handler = async (event) => {
  const { method } = event.requestContext.http;

  for (const route of routes) {
    const match = event.rawPath.match(route.path);
    if (match && route.method === method) {
      try {
        return await route.run(event, match.groups ?? {});
      } catch (err) {
        console.error(err); // shows up in CloudWatch Logs
        return json(500, { error: "internal error" });
      }
    }
  }

  return json(404, { error: "not found" });
};
