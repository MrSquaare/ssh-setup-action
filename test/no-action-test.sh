#!/bin/sh

set -eu

. ./test/helpers.sh

command_name="${1:-}"
CASE_DIR="${TEST_CASE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/no-action.XXXXXX")}" 
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
}

verify() {
  clone_target="$CASE_DIR/clone-no-action"

  if git clone "ssh://$TEST_SSH_USER@127.0.0.1:$TEST_SSH_PORT$REPO_ONE" "$clone_target"; then
    fail "clone succeeded without action setup"
  fi
}

case "$command_name" in
  setup)
    setup
    ;;
  verify)
    verify
    ;;
  *)
    fail "usage: no-action-test.sh <setup|verify>"
    ;;
esac
