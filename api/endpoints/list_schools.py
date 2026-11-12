"""GET /api/schools -> [{id, name, interview_date?, sort_order, done, done_at?}, ...]"""

from lib import db
from lib.responses import json_response


def list_schools(event, params):
    # One scan page holds up to 1 MB; a dozen schools is a few hundred bytes.
    items = db.table.scan()["Items"]
    items.sort(key=lambda school: school["sort_order"])
    return json_response(200, items)
