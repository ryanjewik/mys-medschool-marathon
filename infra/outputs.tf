output "site_url" {
  description = "Send her this link."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "api_function_url" {
  description = "Direct Lambda URL (for debugging with curl; the site uses /api/* instead)."
  value       = aws_lambda_function_url.api.function_url
}

output "table_name" {
  description = "DynamoDB table holding the checklist (for poking at it in the console)."
  value       = aws_dynamodb_table.schools.name
}
