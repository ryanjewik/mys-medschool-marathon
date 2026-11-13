# Uploads web/dist/ (run `npm run build` in web/ first) and the generated /config.json.

locals {
  dist = "${path.module}/../web/dist"

  content_types = {
    html  = "text/html; charset=utf-8"
    js    = "text/javascript"
    css   = "text/css"
    json  = "application/json"
    svg   = "image/svg+xml"
    png   = "image/png"
    jpg   = "image/jpeg"
    jpeg  = "image/jpeg"
    jfif  = "image/jpeg"
    gif   = "image/gif"
    webp  = "image/webp"
    avif  = "image/avif"
    mp3   = "audio/mpeg"
    mp4   = "video/mp4"
    woff  = "font/woff"
    woff2 = "font/woff2"
    ico   = "image/x-icon"
    txt   = "text/plain; charset=utf-8"
  }
}

# Stops a deploy of an empty site, which is what you'd get without a build.
resource "terraform_data" "dist_check" {
  lifecycle {
    precondition {
      condition     = fileexists("${local.dist}/index.html")
      error_message = "web/dist/ is empty. Run `npm run build` in web/ first."
    }
  }
}

resource "aws_s3_object" "dist" {
  for_each = fileset(local.dist, "**")

  bucket       = aws_s3_bucket.site.id
  key          = each.value
  source       = "${local.dist}/${each.value}"
  source_hash  = filemd5("${local.dist}/${each.value}")
  content_type = lookup(local.content_types, lower(regex("[^.]*$", each.value)), "application/octet-stream")

  # Vite puts a content hash in every file name under assets/, so those can be cached
  # forever. index.html must always be fresh so it points at the latest assets.
  cache_control = startswith(each.value, "assets/") ? "public, max-age=31536000, immutable" : "no-cache"

  depends_on = [terraform_data.dist_check]
}

resource "aws_s3_object" "config" {
  bucket        = aws_s3_bucket.site.id
  key           = "config.json"
  content_type  = "application/json"
  cache_control = "no-cache"
  content = jsonencode({
    herName      = var.her_name
    finalMessage = var.final_message
  })
}
