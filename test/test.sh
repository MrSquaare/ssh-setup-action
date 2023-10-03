# Load test helpers

. ./test/helpers.sh

# Test cases

test_variables_not_empty() {
  assert_not_empty "SSH_PATH" "$SSH_PATH"
  assert_not_empty "SSH_AGENT_PID" "$SSH_AGENT_PID"
  assert_not_empty "SSH_AUTH_SOCK" "$SSH_AUTH_SOCK"
}

test_outputs_not_empty() {
  assert_not_empty "OUTPUT_SSH_PATH" "$OUTPUT_SSH_PATH"
  assert_not_empty "OUTPUT_SSH_AGENT_PID" "$OUTPUT_SSH_AGENT_PID"
  assert_not_empty "OUTPUT_SSH_AUTH_SOCK" "$OUTPUT_SSH_AUTH_SOCK"
}

test_variables_and_outputs_equals() {
  assert_equals "SSH_PATH, OUTPUT_SSH_PATH" "$SSH_PATH" "$OUTPUT_SSH_PATH"
  assert_equals "SSH_AGENT_PID, OUTPUT_SSH_AGENT_PID" "$SSH_AGENT_PID" "$OUTPUT_SSH_AGENT_PID"
  assert_equals "SSH_AUTH_SOCK, OUTPUT_SSH_AUTH_SOCK" "$SSH_AUTH_SOCK" "$OUTPUT_SSH_AUTH_SOCK"
}


# Run tests

test_variables_not_empty
test_outputs_not_empty
test_variables_and_outputs_equals

echo "All tests passed!"

exit 0
