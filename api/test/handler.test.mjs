// Run with: npm test   (from api/). No AWS needed: DynamoDB calls are stubbed.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.TABLE_NAME = "test-table";
const { db } = await import("../lib/db.mjs");
const { handler } = await import("../handler.mjs");

const event = (method, path, body) => ({
  requestContext: { http: { method } },
  rawPath: path,
  body: body === undefined ? undefined : JSON.stringify(body),
  isBase64Encoded: false,
});

let calls;
beforeEach(() => {
  calls = [];
});
const stubDb = (fn) => {
  db.send = async (cmd) => {
    calls.push(cmd);
    return fn(cmd);
  };
};

test("GET /api/schools returns items sorted by sort_order", async () => {
  stubDb(() => ({ Items: [{ id: "b", sort_order: 1 }, { id: "a", sort_order: 0 }] }));
  const res = await handler(event("GET", "/api/schools"));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body).map((s) => s.id), ["a", "b"]);
});

test("PUT sets done and done_at", async () => {
  stubDb((cmd) => ({ Attributes: { id: "a", done: cmd.input.ExpressionAttributeValues[":done"] } }));
  const res = await handler(event("PUT", "/api/schools/a", { done: true }));
  assert.equal(res.statusCode, 200);
  const values = calls[0].input.ExpressionAttributeValues;
  assert.equal(values[":done"], true);
  assert.match(values[":at"], /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(calls[0].input.Key.id, "a");
});

test("PUT unchecking clears done_at", async () => {
  stubDb(() => ({ Attributes: {} }));
  await handler(event("PUT", "/api/schools/a", { done: false }));
  assert.equal(calls[0].input.ExpressionAttributeValues[":at"], null);
});

test("PUT rejects bad bodies without touching the database", async () => {
  stubDb(() => ({}));
  assert.equal((await handler(event("PUT", "/api/schools/a", { done: "yes" }))).statusCode, 400);
  assert.equal((await handler({ ...event("PUT", "/api/schools/a"), body: "{nope" })).statusCode, 400);
  assert.equal(calls.length, 0);
});

test("PUT unknown school -> 404", async () => {
  stubDb(() => {
    throw Object.assign(new Error("nope"), { name: "ConditionalCheckFailedException" });
  });
  assert.equal((await handler(event("PUT", "/api/schools/zzz", { done: true }))).statusCode, 404);
});

test("unknown route -> 404, unexpected error -> 500", async () => {
  assert.equal((await handler(event("DELETE", "/api/schools/a"))).statusCode, 404);
  stubDb(() => {
    throw new Error("dynamo down");
  });
  const original = console.error;
  console.error = () => {};
  assert.equal((await handler(event("GET", "/api/schools"))).statusCode, 500);
  console.error = original;
});
