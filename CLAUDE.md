# My's Med School Marathon

A small website for one person (My) to check off med school interviews as she finishes them,
with confetti for each school and a message at the end. It will be live for about a week, then torn down
with `terraform destroy`. It's also Ryan's Terraform practice project.

The repo is **public**. My will not see it, but keep personal details out (no emails, real
school lists, or AWS account info). Real values go in `infra/terraform.tfvars`, which is git-ignored.

## Layout

| Path | What |
|---|---|
| `web/` | Vite + React 19 + TypeScript (strict). Plain CSS in `src/style.css`, `canvas-confetti` |
| `web/dev/mock-api.ts` | Dev-only fake API, so `npm run dev` works without AWS |
| `api/` | Python 3.13 Lambda: `handler.py` routes to `endpoints/*.py`; boto3 DynamoDB |
| `docs/architecture.md` | The Terraform plan, and the contract the app expects from it |
| `infra/` | Terraform. **Does not exist yet; Ryan is writing it himself** |

Request flow: CloudFront serves the site from S3 and routes `/api/*` to the Lambda Function URL
(same origin, no CORS). The page also fetches `/config.json` (`herName`, `finalMessage`), which Terraform writes to S3.

## Working agreements

- **Terraform: don't write or scaffold `infra/` unless Ryan explicitly asks.** He's learning it.
  Explain, review what he writes, point to docs, and answer questions. Keep `docs/architecture.md` as the plan.
- **API contract:** `GET /api/schools` and `PUT /api/schools/{id}` with body `{"done": bool}`.
  If it changes, update all four together: `api/endpoints/`, `web/src/types.ts`, `web/dev/mock-api.ts`,
  and the contract section of `docs/architecture.md`.
- Keep it small: no new dependencies or frameworks without a clear reason.
- All pre-commit hooks must pass before committing.

## Commands

Ryan is on **Windows / PowerShell**. Run these from the repo root unless noted.

```powershell
# Frontend (http://localhost:5173, uses the mock API)
cd web; npm install; npm run dev
cd web; npm run build            # type-checks first, then builds web/dist/

# Point the dev server at the deployed backend instead of the mock
$env:API_TARGET="https://dxxxx.cloudfront.net"; npm run dev

# Lambda tests (DynamoDB is faked, no AWS needed)
cd api; py -3.13 -m venv .venv; .venv\Scripts\Activate.ps1; pip install -r requirements-dev.txt; pytest

# Hooks: whitespace/secrets checks, terraform fmt/validate/tflint, ruff, tsc
py -3.13 -m pre_commit run --all-files
```

## Windows notes

- `pre-commit` is installed in the main Python, not the venv: use `py -3.13 -m pre_commit`, and
  `deactivate` the api venv first if it's active.
- The Terraform hooks (pre-commit-terraform) are bash scripts. Once `.tf` files exist, commit from
  **Git Bash**, or they fail with "Executable `bash` not found".
- The TypeScript hook needs `npm install` in `web/` first.

## Deploy-time facts (for when Terraform exists)

- Lambda: runtime `python3.13`, handler `handler.handler`, env `TABLE_NAME`, IAM `dynamodb:Scan` + `dynamodb:UpdateItem`.
  Zip `api/` without `tests/`, `.venv/`, caches, `requirements-dev.txt`, `pyproject.toml`.
- DynamoDB items: `id` (partition key, string), `name`, `sort_order` (number), `done` (bool), optional `interview_date`.
  Terraform-seeded items need `lifecycle { ignore_changes = [item] }`, or a later apply resets her checkmarks.
- Run `npm run build` before `terraform apply`. Terraform uploads `web/dist/`.
