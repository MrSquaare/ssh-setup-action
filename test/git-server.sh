#!/bin/sh

set -eu

. ./test/helpers.sh

command_name="${1:-}"

start() {
  case_dir="$1"
  sshd_port="$2"
  ssh_dir="$3"
  repos_dir="$4"

  image_tag="ssh-setup-action/test-git-server:local"
  container_name="ssh-setup-action-git-$(basename "$case_dir")-$(date +%s)-$$"

  docker build -f ./test/Dockerfile.git-server -t "$image_tag" . >/dev/null

  if ! container_id="$(docker run -d \
    --name "$container_name" \
    -p "$sshd_port:22" \
    "$image_tag" 2>&1)"; then
    fail "unable to start git server: $container_id"
  fi

  docker exec "$container_id" sh -lc 'mkdir -p /root/.ssh /repos'
  docker cp "$ssh_dir/authorized_keys" "$container_id:/root/.ssh/authorized_keys"
  docker cp "$repos_dir/." "$container_id:/repos"
  docker exec "$container_id" sh -lc 'chown -R root:root /root/.ssh && chmod 700 /root/.ssh && chmod 600 /root/.ssh/authorized_keys'

  # Give sshd a moment to initialize.
  sleep 0.3

  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    set_step_output "container_id" "$container_id"
  fi

  printf '%s\n' "$container_id"
}

case "$command_name" in
  start)
    [ "$#" -eq 5 ] || fail "usage: git-server.sh start <case-dir> <port> <ssh-dir> <repos-dir>"
    start "$2" "$3" "$4" "$5"
    ;;
  *)
    fail "usage: git-server.sh start <case-dir> <port> <ssh-dir> <repos-dir>"
    ;;
esac
