"""PUT /api/schools/{id}  body: {"done": true | false}  -> the updated school"""

from datetime import UTC, datetime

from botocore.exceptions import ClientError

from lib import db
from lib.responses import json_response, parse_json_body


def update_school(event, params):
    try:
        body = parse_json_body(event)
    except ValueError:
        return json_response(400, {"error": "body must be JSON"})

    done = body.get("done") if isinstance(body, dict) else None
    if not isinstance(done, bool):
        return json_response(400, {"error": 'body must be {"done": true|false}'})

    done_at = datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")
    try:
        result = db.table.update_item(
            Key={"id": params["id"]},
            UpdateExpression="SET done = :done, done_at = :at",
            ConditionExpression="attribute_exists(id)",  # unknown id -> 404, not a junk item
            ExpressionAttributeValues={":done": done, ":at": done_at if done else None},
            ReturnValues="ALL_NEW",
        )
    except ClientError as err:
        if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return json_response(404, {"error": "unknown school"})
        raise

    return json_response(200, result["Attributes"])
