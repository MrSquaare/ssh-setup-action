#!/bin/sh

set -eu

. ./test/helpers.sh

command_name="${1:-}"
CASE_DIR="${TEST_CASE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/multiple-test.XXXXXX")}" 
SSH_PORT="${TEST_SSH_PORT:-$(random_port)}"

setup() {
  mkdir -p "$CASE_DIR/keys" "$CASE_DIR/repos" "$CASE_DIR/ssh"

  generate_ssh_keypair rsa "$CASE_DIR/keys/github" 2048
  generate_ssh_keypair ed25519 "$CASE_DIR/keys/gitlab"
  generate_ssh_keypair rsa "$CASE_DIR/keys/server" 3072

  cat "$CASE_DIR/keys/github.pub" "$CASE_DIR/keys/gitlab.pub" "$CASE_DIR/keys/server.pub" > "$CASE_DIR/ssh/authorized_keys"

  create_bare_test_repo "$CASE_DIR" "$CASE_DIR/repos/repo-one.git" "repo-one"
  create_bare_test_repo "$CASE_DIR" "$CASE_DIR/repos/repo-two.git" "repo-two"

  set_step_output "case_dir" "$CASE_DIR"
  set_step_output "host" "127.0.0.1"
  set_step_output "port" "$SSH_PORT"
  set_step_output "ssh_user" "root"
  set_step_output "repo_one" "/repos/repo-one.git"
  set_step_output "repo_two" "/repos/repo-two.git"
  set_step_output "ssh_dir" "$CASE_DIR/ssh"
  set_step_output "repos_dir" "$CASE_DIR/repos"
  set_multiline_step_output "private_key_github" "$(cat "$CASE_DIR/keys/github")"
  set_multiline_step_output "private_key_gitlab" "$(cat "$CASE_DIR/keys/gitlab")"
  set_multiline_step_output "private_key_server" "$(cat "$CASE_DIR/keys/server")"
}

verify() {
  assert_equals "reuse pid 1->2" "$ACTION1_SSH_AGENT_PID" "$ACTION2_SSH_AGENT_PID"
  assert_equals "reuse pid 2->3" "$ACTION2_SSH_AGENT_PID" "$ACTION3_SSH_AGENT_PID"
  assert_equals "reuse sock 1->2" "$ACTION1_SSH_AUTH_SOCK" "$ACTION2_SSH_AUTH_SOCK"
  assert_equals "reuse sock 2->3" "$ACTION2_SSH_AUTH_SOCK" "$ACTION3_SSH_AUTH_SOCK"

  key_count="$(env "SSH_AUTH_SOCK=$ACTION3_SSH_AUTH_SOCK" "SSH_AGENT_PID=$ACTION3_SSH_AGENT_PID" ssh-add -l | wc -l | tr -d ' ')"
  assert_true "three keys loaded" "[ $key_count -ge 3 ]"

  clone_one="$CASE_DIR/clone-repo-one"
  clone_two="$CASE_DIR/clone-repo-two"

  git clone "ssh://$TEST_SSH_USER@127.0.0.1:$TEST_SSH_PORT$REPO_ONE" "$clone_one"

  git clone "ssh://$TEST_SSH_USER@127.0.0.1:$TEST_SSH_PORT$REPO_TWO" "$clone_two"

  assert_file_exists "clone one README" "$clone_one/README.md"
  assert_file_exists "clone two README" "$clone_two/README.md"
}

case "$command_name" in
  setup)
    setup
    ;;
  verify)
    verify
    ;;
  *)
    fail "usage: multiple-test.sh <setup|verify>"
    ;;
esac
