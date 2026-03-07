#!/bin/sh

set -eu

. ./test/helpers.sh

command_name="${1:-}"
CASE_DIR="${TEST_CASE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/single-test.XXXXXX")}" 
SSH_PORT="${TEST_SSH_PORT:-$(random_port)}"

setup() {
  mkdir -p "$CASE_DIR/keys" "$CASE_DIR/repos" "$CASE_DIR/ssh"

  generate_ssh_keypair rsa "$CASE_DIR/keys/id_rsa" 2048

  cat "$CASE_DIR/keys/id_rsa.pub" > "$CASE_DIR/ssh/authorized_keys"

  create_bare_test_repo "$CASE_DIR" "$CASE_DIR/repos/repo-one.git" "repo-one"

  set_step_output "case_dir" "$CASE_DIR"
  set_step_output "host" "127.0.0.1"
  set_step_output "port" "$SSH_PORT"
  set_step_output "ssh_user" "root"
  set_step_output "repo_one" "/repos/repo-one.git"
  set_step_output "ssh_dir" "$CASE_DIR/ssh"
  set_step_output "repos_dir" "$CASE_DIR/repos"
  set_multiline_step_output "private_key" "$(cat "$CASE_DIR/keys/id_rsa")"
}

verify() {
  assert_not_empty "SSH_PATH" "${ACTION_SSH_PATH:-}"
  assert_not_empty "SSH_AGENT_PID" "${ACTION_SSH_AGENT_PID:-}"
  assert_not_empty "SSH_AUTH_SOCK" "${ACTION_SSH_AUTH_SOCK:-}"

  assert_equals "ssh-path output" "${ACTION_SSH_PATH:-}" "${OUTPUT_SSH_PATH:-}"
  assert_equals "ssh-agent-pid output" "${ACTION_SSH_AGENT_PID:-}" "${OUTPUT_SSH_AGENT_PID:-}"
  assert_equals "ssh-auth-sock output" "${ACTION_SSH_AUTH_SOCK:-}" "${OUTPUT_SSH_AUTH_SOCK:-}"

  assert_file_exists "private key exists" "$ACTION_SSH_PATH/id_rsa"

  clone_target="$CASE_DIR/clone-single"

  git clone "ssh://$TEST_SSH_USER@127.0.0.1:$TEST_SSH_PORT$REPO_ONE" "$clone_target"

  assert_file_exists "clone README" "$clone_target/README.md"
}

case "$command_name" in
  setup)
    setup
    ;;
  verify)
    verify
    ;;
  *)
    fail "usage: single-test.sh <setup|verify>"
    ;;
esac
