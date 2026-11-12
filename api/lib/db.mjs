// Shared DynamoDB client. Created once per Lambda container and reused across requests.
// The Node 22 Lambda runtime ships AWS SDK v3, so it is not bundled in the zip.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const TABLE = process.env.TABLE_NAME; // set by Terraform (api.tf)
