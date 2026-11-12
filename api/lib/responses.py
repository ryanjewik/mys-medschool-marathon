"""Request/response helpers for Lambda Function URL events (payload format 2.0)."""

import base64
import json
from decimal import Decimal


def _to_json(value):
    # boto3 returns every DynamoDB number as Decimal, which json can't serialize.
    if isinstance(value, Decimal):
        return int(value) if value == value.to_integral_value() else float(value)
    raise TypeError(f"{type(value).__name__} is not JSON serializable")


def json_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"content-type": "application/json", "cache-control": "no-store"},
        "body": json.dumps(body, default=_to_json),
    }


def parse_json_body(event):
    """Return the parsed JSON body, or None if there is none. Raises ValueError if invalid."""
    body = event.get("body")
    if not body:
        return None
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    return json.loads(body)
