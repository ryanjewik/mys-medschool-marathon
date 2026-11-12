"""Run from api/:  pytest   (no AWS needed: the DynamoDB table is faked)."""

import json
from decimal import Decimal

import pytest
from botocore.exceptions import ClientError

from handler import handler
from lib import db


def event(method, path, body=None, raw_body=None):
    return {
        "requestContext": {"http": {"method": method}},
        "rawPath": path,
        "body": raw_body if raw_body is not None else (None if body is None else json.dumps(body)),
        "isBase64Encoded": False,
    }


class FakeTable:
    def __init__(self, items=None, error=None):
        self.items = items or []
        self.error = error
        self.calls = []

    def scan(self):
        self.calls.append(("scan", {}))
        if self.error:
            raise self.error
        return {"Items": self.items}

    def update_item(self, **kwargs):
        self.calls.append(("update_item", kwargs))
        if self.error:
            raise self.error
        return {
            "Attributes": {"id": kwargs["Key"]["id"], "done": kwargs["ExpressionAttributeValues"][":done"]}
        }


@pytest.fixture
def table(monkeypatch):
    def install(**kwargs):
        fake = FakeTable(**kwargs)
        monkeypatch.setattr(db, "table", fake)
        return fake

    return install


def test_list_sorts_by_sort_order_and_serializes_decimals(table):
    table(items=[{"id": "b", "sort_order": Decimal(1)}, {"id": "a", "sort_order": Decimal(0)}])
    res = handler(event("GET", "/api/schools"), None)
    assert res["statusCode"] == 200
    assert json.loads(res["body"]) == [{"id": "a", "sort_order": 0}, {"id": "b", "sort_order": 1}]


def test_put_sets_done_and_timestamp(table):
    fake = table()
    res = handler(event("PUT", "/api/schools/a", {"done": True}), None)
    assert res["statusCode"] == 200
    _, kwargs = fake.calls[0]
    assert kwargs["Key"] == {"id": "a"}
    assert kwargs["ExpressionAttributeValues"][":done"] is True
    assert kwargs["ExpressionAttributeValues"][":at"].endswith("Z")


def test_put_unchecking_clears_timestamp(table):
    fake = table()
    handler(event("PUT", "/api/schools/a", {"done": False}), None)
    assert fake.calls[0][1]["ExpressionAttributeValues"][":at"] is None


@pytest.mark.parametrize("raw_body", ['{"done": "yes"}', "{nope", "[1, 2]", ""])
def test_put_rejects_bad_bodies_without_touching_the_table(table, raw_body):
    fake = table()
    res = handler(event("PUT", "/api/schools/a", raw_body=raw_body), None)
    assert res["statusCode"] == 400
    assert fake.calls == []


def test_put_unknown_school_is_404(table):
    error = ClientError({"Error": {"Code": "ConditionalCheckFailedException"}}, "UpdateItem")
    table(error=error)
    assert handler(event("PUT", "/api/schools/zzz", {"done": True}), None)["statusCode"] == 404


def test_unknown_route_is_404(table):
    table()
    assert handler(event("DELETE", "/api/schools/a"), None)["statusCode"] == 404
    assert handler(event("GET", "/api/schools/"), None)["statusCode"] == 404


def test_unexpected_error_is_500(table):
    table(error=RuntimeError("dynamo down"))
    assert handler(event("GET", "/api/schools"), None)["statusCode"] == 500
