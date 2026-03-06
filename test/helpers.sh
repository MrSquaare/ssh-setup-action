#!/bin/sh

set -eu

fail() {
  printf 'Assertion failed: %s\n' "$*" >&2
  exit 1
}

assert_equals() {
  name="$1"
  left="$2"
  right="$3"

  [ "$left" = "$right" ] || fail "[$name] expected '$left' to equal '$right'"
}

assert_not_equals() {
  name="$1"
  left="$2"
  right="$3"

  [ "$left" != "$right" ] || fail "[$name] expected values to differ, both were '$left'"
}

assert_not_empty() {
  name="$1"
  value="$2"

  [ -n "$value" ] || fail "[$name] expected non-empty value"
}

assert_file_exists() {
  name="$1"
  file_path="$2"

  [ -f "$file_path" ] || fail "[$name] expected file '$file_path' to exist"
}

assert_true() {
  name="$1"
  cmd="$2"

  sh -c "$cmd" >/dev/null 2>&1 || fail "[$name] command failed: $cmd"
}

random_port() {
  if [ -r /dev/urandom ]; then
    rand_num="$(od -An -N2 -tu2 /dev/urandom | tr -d ' ')"
    printf '%s\n' "$((20000 + (rand_num % 20000)))"
    return
  fi

  awk -v seed="$$" 'BEGIN { srand(seed); print int(20000 + rand() * 20000) }'
}

set_step_output() {
  key="$1"
  value="$2"

  [ -n "${GITHUB_OUTPUT:-}" ] || fail "GITHUB_OUTPUT is not set"
  printf '%s=%s\n' "$key" "$value" >> "$GITHUB_OUTPUT"
}

set_multiline_step_output() {
  key="$1"
  value="$2"
  delim="EOF_$(date +%s)_$$"

  [ -n "${GITHUB_OUTPUT:-}" ] || fail "GITHUB_OUTPUT is not set"
  {
    printf '%s<<%s\n' "$key" "$delim"
    printf '%s\n' "$value"
    printf '%s\n' "$delim"
  } >> "$GITHUB_OUTPUT"
}

generate_ssh_keypair() {
  key_type="$1"
  key_path="$2"
  bits="${3:-}"

  if [ "$key_type" = "rsa" ] && [ -n "$bits" ]; then
    ssh-keygen -t "$key_type" -b "$bits" -N "" -f "$key_path" >/dev/null
    return
  fi

  ssh-keygen -t "$key_type" -N "" -f "$key_path" >/dev/null
}

create_bare_test_repo() {
  work_dir="$1"
  bare_repo_path="$2"
  repo_label="$3"

  src_repo="$work_dir/${repo_label}-src"
  mkdir -p "$src_repo"

  git -C "$src_repo" init >/dev/null
  git -C "$src_repo" config user.name "ssh-setup-action-test"
  git -C "$src_repo" config user.email "tests@example.local"

  printf 'repository=%s\n' "$repo_label" > "$src_repo/README.md"
  git -C "$src_repo" add README.md
  git -C "$src_repo" commit -m "init" >/dev/null

  git clone --bare "$src_repo" "$bare_repo_path" >/dev/null
}
