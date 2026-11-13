output "site_url" {
  description = "The link to send her."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "distribution_id" {
  description = "For invalidating the CloudFront cache after a redeploy."
  value       = aws_cloudfront_distribution.site.id
}

output "bucket_name" {
  description = "The S3 bucket holding the built site."
  value       = aws_s3_bucket.site.bucket
}

output "table_name" {
  description = "The DynamoDB table with her checkmarks."
  value       = aws_dynamodb_table.schools.name
}
