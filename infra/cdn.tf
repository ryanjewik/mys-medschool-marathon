# CloudFront: the one public URL (https://dXXXX.cloudfront.net).
#   /*      -> S3 bucket (the Vite site)
#   /api/*  -> Lambda Function URL (the backend)
# Same origin for both, so the frontend calls fetch("/api/schools") — no CORS, no API URL config.

# AWS-managed policies, looked up by name.
data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_except_host" {
  # Forward everything except Host — a Function URL rejects a mismatched Host header.
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

locals {
  s3_origin_id  = "site-bucket"
  api_origin_id = "api-lambda"
  # "https://abc123.lambda-url.us-east-1.on.aws/" -> "abc123.lambda-url.us-east-1.on.aws"
  api_domain = trimsuffix(trimprefix(aws_lambda_function_url.api.function_url, "https://"), "/")
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # cheapest edge locations (US/EU) — fine for one user
  comment             = var.project_name

  origin {
    origin_id                = local.s3_origin_id
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  origin {
    origin_id   = local.api_origin_id
    domain_name = local.api_domain

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Static site. Caching is disabled so redeploys show up immediately — at this
  # traffic level caching saves nothing. (Swap to Managed-CachingOptimized + invalidations
  # if you want the practice.)
  default_cache_behavior {
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.disabled.id
  }

  # Backend. Must allow writes and must never cache.
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = local.api_origin_id
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_except_host.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Free *.cloudfront.net certificate — no ACM, no domain needed.
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
