import os

# Must be set before lib.db is imported. No AWS calls are made: the table is replaced in tests.
os.environ.setdefault("TABLE_NAME", "test-table")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
