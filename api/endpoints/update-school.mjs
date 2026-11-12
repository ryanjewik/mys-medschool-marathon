// PUT /api/schools/{id}  body: {"done": true | false}  -> the updated school
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE } from "../lib/db.mjs";
import { json, parseJsonBody } from "../lib/http.mjs";

export async function updateSchool(event, { id }) {
  let body;
  try {
    body = parseJsonBody(event);
  } catch {
    return json(400, { error: "body must be JSON" });
  }
  if (typeof body?.done !== "boolean") {
    return json(400, { error: 'body must be {"done": true|false}' });
  }

  try {
    const { Attributes } = await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "SET done = :done, done_at = :at",
        ConditionExpression: "attribute_exists(id)", // unknown id -> 404, not a new junk item
        ExpressionAttributeValues: {
          ":done": body.done,
          ":at": body.done ? new Date().toISOString() : null,
        },
        ReturnValues: "ALL_NEW",
      }),
    );
    return json(200, Attributes);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return json(404, { error: "unknown school" });
    }
    throw err;
  }
}
