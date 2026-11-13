# The checklist itself: one item per school, seeded from data/schools.json.

locals {
  schools = jsondecode(file("${path.module}/../data/schools.json"))
}

resource "aws_dynamodb_table" "schools" {
  name         = "${var.project}-schools"
  billing_mode = "PAY_PER_REQUEST" # a few requests a day; no capacity to manage
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table_item" "school" {
  for_each = { for school in local.schools : school.id => school }

  table_name = aws_dynamodb_table.schools.name
  hash_key   = aws_dynamodb_table.schools.hash_key

  item = jsonencode({
    id             = { S = each.value.id }
    name           = { S = each.value.name }
    full_name      = { S = each.value.full_name }
    location       = { S = each.value.location }
    interview_date = { S = each.value.interview_date }
    sort_order     = { N = tostring(each.value.sort_order) }
    done           = { BOOL = each.value.done }
  })

  # The Lambda changes `done` as she checks schools off. Without this, the next
  # `terraform apply` would put every item back to what's in schools.json.
  lifecycle {
    ignore_changes = [item]
  }
}
