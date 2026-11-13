terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}

# Credentials come from the environment: set AWS_PROFILE before running Terraform.
provider "aws" {
  region = var.aws_region

  # Every resource gets this tag, so leftovers are easy to find after `terraform destroy`.
  default_tags {
    tags = {
      Project = var.project
    }
  }
}

data "aws_caller_identity" "current" {}
