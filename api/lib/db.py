"""Shared DynamoDB table handle, created once per Lambda container and reused.

The Lambda Python runtime ships boto3, so it is not bundled in the zip.
"""

import os

import boto3

TABLE_NAME = os.environ["TABLE_NAME"]  # set by Terraform
table = boto3.resource("dynamodb").Table(TABLE_NAME)
