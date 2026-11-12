# Terraform architecture

The plan for the Terraform you'll write in `infra/`. Each box is a `.tf` file and the
resources it should contain.
An arrow means "uses a value from": Terraform reads these references to decide
creation order, so arrows run from what is created first to what is created later.

```
 terraform.tfvars
   schools[]            her_name                          budget_email
      │                    │                                   │
      ▼                    │                                   ▼
 ┌ data.tf ─────────────┐  │                          ┌ budget.tf ─────────┐
 │ dynamodb_table       │  │                          │ budgets_budget     │
 │  └ table_item × N    │  │                          └────────────────────┘
 └──────────┬───────────┘  │
            │ table arn    │       ┌ storage.tf ──────────────┐
            ▼              │       │ s3_bucket                │
 ┌ api.tf ──────────────┐  │       │  ├ public_access_block   │
 │ iam_role + policies  │  │       │  └ bucket_policy ◄───────┼───┐
 │ archive_file (zip)   │  │       └─────┬─────────────┬──────┘   │
 │ lambda_function      │  │             │             │ bucket   │
 │  ├ function_url      │  │             │             ▼          │
 │  └ permission × 2    │  │             │   ┌ site.tf ─────────┐ │
 └──────────┬───────────┘  └─────────────┼──►│ s3_object dist×N │ │
            │ function url               │   │ s3_object config │ │
            │                bucket domain   └──────────────────┘ │
            ▼                            ▼                        │
 ┌ cdn.tf ──────────────────────────────────────────┐             │
 │ origin_access_control                            │ dist arn    │
 │ cloudfront_distribution                          ├─────────────┘
 │   /*      → S3 bucket origin                     │
 │   /api/*  → Lambda URL origin                    │
 └────────────────────────┬─────────────────────────┘
                          ▼
                outputs.tf → site_url
```

- **data -> api -> cdn:** the table must exist before the Lambda's IAM policy can name it,
  and the Lambda URL must exist before CloudFront can route `/api/*` to it.
- **storage -> site / cdn:** the bucket comes first; files are uploaded into it and
  CloudFront serves the static site from it.
- **cdn -> bucket_policy (the loop back):** the policy allows reads only from this
  distribution, so it needs the distribution's ARN. That's why the policy is a separate
  resource from the bucket; otherwise the two would wait on each other.
- `versions.tf` and `variables.tf` aren't drawn; they feed everything.

## What the app code expects from your Terraform

The frontend (`web/`) and the Lambda (`api/`) are already written and depend on these:

- **One URL for everything:** CloudFront serves the site from S3 and sends `/api/*` to the
  Lambda. The frontend calls `/api/schools` with relative paths, so there's no API URL to configure.
- **`/config.json` in the bucket:** `{"herName": "...", "finalMessage": "..."}`. The page
  reads it on load.
- **The built site:** the contents of `web/dist/` (from `npm run build`), uploaded with
  correct `Content-Type`s.
- **DynamoDB table:** partition key `id` (string). One item per school with
  `id`, `name`, `sort_order` (number), `done` (bool), and optionally `interview_date` (`"YYYY-MM-DD"`).
- **Lambda:** runtime `nodejs22.x`, handler `handler.handler`, code zipped from `api/`
  (leave out `node_modules`, `test`, `package*.json`). Environment variable `TABLE_NAME`.
  Its IAM role needs `dynamodb:Scan` and `dynamodb:UpdateItem` on the table.

Generate the real graph from your code once it exists:

```bash
terraform -chdir=infra graph | dot -Tsvg > docs/graph.svg
```
