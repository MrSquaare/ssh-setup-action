#!/bin/sh

set -eu

. ./test/helpers.sh

command_name="${1:-}"
CASE_DIR="${TEST_CASE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/reuse-stale.XXXXXX")}" 
SSH_PORT="${TEST_SSH_PORT:-$(random_port)}"

setup() {
  mkdir -p "$CASE_DIR/keys" "$CASE_DIR/repos" "$CASE_DIR/ssh"

  generate_ssh_keypair rsa "$CASE_DIR/keys/stale" 2048

  cat "$CASE_DIR/keys/stale.pub" > "$CASE_DIR/ssh/authorized_keys"

  create_bare_test_repo "$CASE_DIR" "$CASE_DIR/repos/repo-one.git" "repo-one"

  set_step_output "case_dir" "$CASE_DIR"
  set_step_output "host" "127.0.0.1"
  set_step_output "port" "$SSH_PORT"
  set_step_output "ssh_user" "root"
  set_step_output "repo_one" "/repos/repo-one.git"
  set_step_output "ssh_dir" "$CASE_DIR/ssh"
  set_step_output "repos_dir" "$CASE_DIR/repos"
  set_multiline_step_output "private_key" "$(cat "$CASE_DIR/keys/stale")"
}

verify() {
  assert_not_equals "new agent pid from stale" "$ACTION_SSH_AGENT_PID" "$FAKE_SSH_AGENT_PID"
  assert_not_equals "new agent sock from stale" "$ACTION_SSH_AUTH_SOCK" "$FAKE_SSH_AUTH_SOCK"

  clone_target="$CASE_DIR/clone-stale"

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
    fail "usage: multiple-reuse-stale-test.sh <setup|verify>"
    ;;
esac
