# My's Med School Marathon 🩺

A tiny, one-week website to celebrate finishing med school interviews: a checklist of
schools she checks off as she goes, with confetti for each one and a message at the end.

Also a Terraform practice project. Everything is created with `terraform apply` and
removed with `terraform destroy`.

```
Browser ─► CloudFront ─┬─► S3          (Vite static site + config.json)
                       └─► /api/* ─► Lambda ─► DynamoDB  (checkmarks)
```

| Folder | What's in it |
|---|---|
| `infra/` | Terraform: S3, CloudFront, Lambda, DynamoDB, IAM, a budget alert |
| `api/` | Lambda backend: `GET /api/schools`, `PUT /api/schools/{id}` |
| `web/` | Vite frontend (vanilla JS + canvas-confetti), with a mock API for local dev |
| `docs/architecture.md` | How the Terraform resources depend on each other |

**Getting started:** see [SETUP.md](SETUP.md).

**Quick local try (no AWS):**

```bash
cd web && npm install && npm run dev
```

Costs roughly $0 on AWS free tiers; the CloudFront `*.cloudfront.net` URL is free.
