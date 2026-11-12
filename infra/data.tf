# One table, one item per school. On-demand billing = pennies at most (likely $0).

resource "aws_dynamodb_table" "schools" {
  name         = "${var.project_name}-schools"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

# Seed items from var.schools. for_each keys on id, so reordering the list is harmless.
resource "aws_dynamodb_table_item" "school" {
  for_each = { for idx, s in var.schools : s.id => merge(s, { sort_order = idx }) }

  table_name = aws_dynamodb_table.schools.name
  hash_key   = aws_dynamodb_table.schools.hash_key

  item = jsonencode(merge(
    {
      id         = { S = each.value.id }
      name       = { S = each.value.name }
      sort_order = { N = tostring(each.value.sort_order) }
      done       = { BOOL = false }
    },
    each.value.interview_date == null ? {} : { interview_date = { S = each.value.interview_date } }
  ))

  # Terraform creates the item; the app owns it afterward. Without this, any later
  # `terraform apply` would reset her checkmarks back to done = false.
  lifecycle {
    ignore_changes = [item]
  }
}
