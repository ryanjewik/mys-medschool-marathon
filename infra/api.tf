# The backend: one small Lambda with a public Function URL, reached via CloudFront at /api/*.

# --- IAM: what the Lambda is allowed to do ---------------------------------------

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api" {
  name               = "${var.project_name}-api"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

# Least privilege: read the list, update an item. No delete, no other tables.
data "aws_iam_policy_document" "api_dynamodb" {
  statement {
    actions   = ["dynamodb:Scan", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.schools.arn]
  }
}

resource "aws_iam_role_policy" "api_dynamodb" {
  name   = "dynamodb-access"
  role   = aws_iam_role.api.id
  policy = data.aws_iam_policy_document.api_dynamodb.json
}

# Lets the function write logs to CloudWatch (where console.log goes).
resource "aws_iam_role_policy_attachment" "api_logs" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${var.project_name}-api"
  retention_in_days = 7 # matches the project's lifespan
}

# --- The function ----------------------------------------------------------------

# Zips ../api at plan time. Node 22's runtime includes AWS SDK v3, so node_modules
# (local dev/test only) and the tests stay out of the zip.
data "archive_file" "api" {
  type        = "zip"
  source_dir  = "${path.module}/../api"
  output_path = "${path.module}/build/api.zip"
  excludes    = ["node_modules/**", "test/**", "package.json", "package-lock.json"]
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.project_name}-api"
  role             = aws_iam_role.api.arn
  runtime          = "nodejs22.x"
  handler          = "handler.handler" # file handler.mjs, export `handler`
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256 # redeploys when code changes
  timeout          = 5
  memory_size      = 128

  # Terraform variable -> environment variable the running code reads.
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.schools.name
    }
  }

  depends_on = [aws_cloudwatch_log_group.api, aws_iam_role_policy_attachment.api_logs]
}

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE" # public; the "security" here is an obscure URL
}

# A public Function URL needs BOTH of these resource-policy permissions, or calls return 403.
resource "aws_lambda_permission" "url_invoke" {
  statement_id           = "AllowPublicFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.api.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "url_invoke_function" {
  statement_id             = "AllowPublicInvokeViaFunctionUrl"
  action                   = "lambda:InvokeFunction"
  function_name            = aws_lambda_function.api.function_name
  principal                = "*"
  invoked_via_function_url = true # only via the URL, not direct API calls
}
