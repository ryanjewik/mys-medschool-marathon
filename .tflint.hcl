# TFLint config — https://github.com/terraform-linters/tflint
# Run `tflint --init` once per machine to download the plugins below.

config {
  call_module_type = "local"
}

# Core Terraform rules: unused variables, missing types/descriptions, naming, etc.
plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

# AWS rules: invalid values (runtimes, regions, instance types), deprecated settings.
plugin "aws" {
  enabled = true
  version = "0.50.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

# Stricter extras worth having on a learning project.
rule "terraform_documented_variables" { enabled = true }
rule "terraform_documented_outputs" { enabled = true }
rule "terraform_naming_convention" { enabled = true }
