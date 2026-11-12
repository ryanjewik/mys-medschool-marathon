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

  # Local state (terraform.tfstate in this folder) is fine for a one-week project.
  # Optional practice: move state to S3. The bucket must already exist — create it
  # by hand or in a separate tiny "bootstrap" config (the classic chicken-and-egg).
  #
  # backend "s3" {
  #   bucket       = "your-tf-state-bucket"
  #   key          = "mys-med-school-marathon/terraform.tfstate"
  #   region       = "us-east-1"
  #   use_lockfile = true
  # }
}

provider "aws" {
  region = var.aws_region

  # Every resource gets these tags — handy for finding stragglers after destroy.
  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "terraform"
    }
  }
}
