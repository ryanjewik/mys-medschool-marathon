// GET /api/schools -> [{ id, name, interview_date?, sort_order, done, done_at? }, ...]
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE } from "../lib/db.mjs";
import { json } from "../lib/http.mjs";

export async function listSchools() {
  // A Scan returns up to 1 MB per call; a dozen schools is a few hundred bytes.
  const { Items = [] } = await db.send(new ScanCommand({ TableName: TABLE }));
  Items.sort((a, b) => a.sort_order - b.sort_order);
  return json(200, Items);
}
