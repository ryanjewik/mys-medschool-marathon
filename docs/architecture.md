# Terraform architecture

Each box is a `.tf` file in `infra/` and the resources it contains.
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

Generate the real graph from the code:

```bash
terraform -chdir=infra graph | dot -Tsvg > docs/graph.svg
```
