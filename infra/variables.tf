variable "project_name" {
  description = "Prefix for resource names."
  type        = string
  default     = "mys-med-school-marathon"
}

variable "aws_region" {
  description = "Region for S3, Lambda and DynamoDB. (CloudFront is global.)"
  type        = string
  default     = "us-east-1"
}

variable "her_name" {
  description = "Shown on the page. Delivered to the browser via /config.json."
  type        = string
}

variable "final_message" {
  description = "Shown when every school is checked off. Delivered via /config.json."
  type        = string
  default     = "Every interview done. I'm so proud of you."
}

variable "schools" {
  description = "Seed list of schools. Each id must be unique, URL-safe and never change."
  type = list(object({
    id             = string           # e.g. "ucsf"
    name           = string           # e.g. "UCSF School of Medicine"
    interview_date = optional(string) # e.g. "2026-11-20"
  }))

  validation {
    condition     = length(var.schools) == length(distinct([for s in var.schools : s.id]))
    error_message = "School ids must be unique."
  }
}

variable "budget_email" {
  description = "Where AWS Budgets sends the cost alert."
  type        = string
}

variable "budget_limit_usd" {
  description = "Monthly budget that triggers the alert."
  type        = number
  default     = 5
}
