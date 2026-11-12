# Uploads the built Vite app (web/dist) to S3. Run `npm run build` in ../web first.

locals {
  dist_dir = "${path.module}/../web/dist"

  # S3 must be told each file's Content-Type or browsers won't render it correctly.
  mime_types = {
    html  = "text/html"
    js    = "text/javascript"
    css   = "text/css"
    json  = "application/json"
    svg   = "image/svg+xml"
    png   = "image/png"
    jpg   = "image/jpeg"
    ico   = "image/x-icon"
    webp  = "image/webp"
    woff2 = "font/woff2"
  }
}

resource "aws_s3_object" "dist" {
  for_each = fileset(local.dist_dir, "**")

  bucket       = aws_s3_bucket.site.id
  key          = each.value
  source       = "${local.dist_dir}/${each.value}"
  etag         = filemd5("${local.dist_dir}/${each.value}") # re-upload when the file changes
  content_type = lookup(local.mime_types, reverse(split(".", each.value))[0], "application/octet-stream")
}

# Runtime config: Terraform variables reaching the browser without rebuilding the app.
# The frontend does fetch("/config.json") on load.
resource "aws_s3_object" "config" {
  bucket       = aws_s3_bucket.site.id
  key          = "config.json"
  content_type = "application/json"
  content = jsonencode({
    herName      = var.her_name
    finalMessage = var.final_message
  })
}
