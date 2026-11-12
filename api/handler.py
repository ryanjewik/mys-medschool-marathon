"""Lambda entry point (handler = "handler.handler"). Reached via CloudFront at /api/*.

Matches method + path to an endpoint; each endpoint returns an HTTP response dict.
"""

import logging
import re

from endpoints.list_schools import list_schools
from endpoints.update_school import update_school
from lib.responses import json_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ROUTES = [
    ("GET", re.compile(r"/api/schools"), list_schools),
    ("PUT", re.compile(r"/api/schools/(?P<id>[\w-]+)"), update_school),
]


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    path = event["rawPath"]

    for route_method, pattern, endpoint in ROUTES:
        match = pattern.fullmatch(path)
        if match and route_method == method:
            try:
                return endpoint(event, match.groupdict())
            except Exception:
                logger.exception("unhandled error")  # shows up in CloudWatch Logs
                return json_response(500, {"error": "internal error"})

    return json_response(404, {"error": "not found"})
