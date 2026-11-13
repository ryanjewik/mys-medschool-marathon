# One HTTPS URL for everything: the site from S3, and /api/* to the Lambda.

locals {
  s3_origin_id  = "site-bucket"
  api_origin_id = "api-lambda"

  # AWS managed policies (same IDs in every account).
  cache_policy_caching_optimized        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  cache_policy_caching_disabled         = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  origin_request_all_viewer_except_host = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
}

resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${var.project}-s3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "lambda" {
  name                              = "${var.project}-lambda"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = var.project
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # US, Canada, Europe: the cheapest
  http_version        = "http2and3"
  is_ipv6_enabled     = true

  origin {
    origin_id                = local.s3_origin_id
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  origin {
    origin_id = local.api_origin_id
    # function_url is "https://<id>.lambda-url.<region>.on.aws/"; CloudFront wants the bare host.
    domain_name              = trimsuffix(trimprefix(aws_lambda_function_url.api.function_url, "https://"), "/")
    origin_access_control_id = aws_cloudfront_origin_access_control.lambda.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy_caching_optimized
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = local.api_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.cache_policy_caching_disabled
    # Everything but Host: the Lambda URL rejects requests carrying the CloudFront Host header.
    origin_request_policy_id = local.origin_request_all_viewer_except_host
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
