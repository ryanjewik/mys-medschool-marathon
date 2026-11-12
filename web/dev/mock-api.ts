// Dev-only stand-in for the Lambda + DynamoDB + Terraform-generated config.json.
// Same routes and response shapes as ../api, data lives in memory (resets on restart).
// Never part of the production build.
import type { ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type { AppConfig, School } from "../src/types";

const config: AppConfig = {
  herName: "My",
  finalMessage: "Every interview done. I'm so proud of you.",
};

const schools: School[] = [
  { id: "school-a", name: "School of Medicine A", interview_date: "2026-11-03", sort_order: 0, done: true, done_at: "2026-11-03T18:00:00Z" },
  { id: "school-b", name: "University B College of Medicine", interview_date: "2026-11-14", sort_order: 1, done: false },
  { id: "school-c", name: "C Medical School", interview_date: "2026-11-20", sort_order: 2, done: false },
  { id: "school-d", name: "D School of Medicine", sort_order: 3, done: false },
];

export function mockApi(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        const send = (status: number, body: unknown): ServerResponse => {
          res.statusCode = status;
          res.setHeader("content-type", "application/json");
          return res.end(JSON.stringify(body));
        };

        if (req.method === "GET" && url === "/config.json") return send(200, config);
        if (req.method === "GET" && url === "/api/schools") return send(200, schools);

        const match = url.match(/^\/api\/schools\/([\w-]+)$/);
        if (req.method === "PUT" && match) {
          let raw = "";
          for await (const chunk of req) raw += chunk;
          let done: unknown;
          try {
            done = JSON.parse(raw).done;
          } catch {
            return send(400, { error: "body must be JSON" });
          }
          if (typeof done !== "boolean") return send(400, { error: 'body must be {"done": true|false}' });
          const school = schools.find((s) => s.id === match[1]);
          if (!school) return send(404, { error: "unknown school" });
          Object.assign(school, { done, done_at: done ? new Date().toISOString() : null });
          await new Promise((r) => setTimeout(r, 250)); // feel a little like a real network
          return send(200, school);
        }

        next();
      });
    },
  };
}
