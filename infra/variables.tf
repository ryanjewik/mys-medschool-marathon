variable "aws_region" {
  description = "Region for the bucket, table and Lambda. CloudFront is global either way."
  type        = string
  default     = "us-west-2"
}

variable "project" {
  description = "Prefix for resource names, and the value of the Project tag on everything."
  type        = string
  default     = "mys-med-school-marathon"
}

variable "her_name" {
  description = "Shown in the page title as \"Congrats, <her_name>!\". Written to /config.json."
  type        = string
}

variable "final_message" {
  description = "Banner shown once every school is checked off. Written to /config.json."
  type        = string
}

variable "budget_email" {
  description = "Where AWS Budgets sends cost alerts."
  type        = string
}

variable "budget_limit_usd" {
  description = "Monthly budget for the whole AWS account, in US dollars. Alerts at 80% actual and 100% forecast."
  type        = number
  default     = 5
}
