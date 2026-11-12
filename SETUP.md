# Local setup checklist: My's Med School Marathon

Everything here is a one-time step on your own machine (macOS + Homebrew assumed).

## 1. Get the project onto your machine

- [ ] Clone the repo:

```bash
git clone https://github.com/ryanjewik/mys-medschool-marathon.git
cd mys-medschool-marathon
```

## 2. Install tools

- [ ] Install the CLIs:

```bash
brew install terraform tflint pre-commit awscli node
```

- [ ] Check they work:

```bash
terraform version && tflint --version && pre-commit --version && aws --version && node --version
```

## 3. Turn on the code-quality hooks

Run these inside the repo. They don't carry over between clones or machines.

- [ ] Install the git hook, download tflint's AWS plugin, then run every check once:

```bash
pre-commit install
tflint --init
pre-commit run --all-files
```

## 4. Optional: Ponytail (Claude Code plugin)

Type these inside Claude Code, not in your shell:

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

## 5. AWS account access

- [ ] Sign in to the AWS console. **Don't use the root user for Terraform**: create an admin user in IAM Identity Center (recommended) or IAM
- [ ] Configure the CLI with one of these:

```bash
aws configure sso
```

```bash
aws configure
```

- [ ] Confirm the CLI is logged in as the right account:

```bash
aws sts get-caller-identity
```

If you used SSO with a named profile, run `export AWS_PROFILE=<profile-name>` before running Terraform.

## 6. Fill in your variables

- [ ] Copy the example file:

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

- [ ] Edit `infra/terraform.tfvars`: her name, the real school list, and your email for budget alerts.
  This file is git-ignored on purpose. Keep it out of GitHub.

## 7. Try it locally, then build the frontend

- [ ] Run the Lambda tests (no AWS needed, DynamoDB is stubbed):

```bash
cd api && npm install && npm test
```

- [ ] Run the site locally against a fake in-memory API (no AWS needed), then open http://localhost:5173:

```bash
cd web && npm install && npm run dev
```

- [ ] Build it for deploy:

```bash
npm run build
```

Terraform uploads whatever is in `web/dist/`. If that folder is empty, the site is blank.

After deploying, you can point the local dev server at the real backend:

```bash
API_TARGET=https://dxxxx.cloudfront.net npm run dev
```

## 8. Deploy

- [ ] Download the providers:

```bash
cd infra && terraform init
```

- [ ] Commit the generated `infra/.terraform.lock.hcl`. It pins exact provider versions.
- [ ] Preview the changes, then apply them:

```bash
terraform plan
```

```bash
terraform apply
```

- [ ] Wait about 5 to 10 minutes for CloudFront, then open the `site_url` output
- [ ] Check off a school, refresh, and make sure it stays checked
- [ ] Send her the link 🎉

## 9. Tear down (about a week later)

- [ ] Delete everything:

```bash
cd infra && terraform destroy
```

CloudFront takes 10 to 20 minutes to delete. Let it finish.

- [ ] Double-check the AWS console (S3, CloudFront, Lambda, DynamoDB) for leftovers.
  Filter by the tag `Project = mys-med-school-marathon`.
- [ ] Optional: archive or delete the GitHub repo
