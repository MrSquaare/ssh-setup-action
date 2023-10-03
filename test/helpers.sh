# Test helpers

assert_equals () {
  if [ "$2" != "$3" ]; then
    echo "[$1] Assertion failed: \"$2\" = \"$3\""
    exit 1
  fi
}

assert_not_equals () {
  if [ "$2" = "$3" ]; then
    echo "[$1] Assertion failed: \"$2\" = \"$3\""
    exit 1
  fi
}

assert_empty () {
  if [ -n "$2" ]; then
    echo "[$1] Assertion failed: \"$2\" is not empty"
    exit 1
  fi
}

assert_not_empty () {
  if [ -z "$2" ]; then
    echo "[$1] Assertion failed: is empty"
    exit 1
  fi
}
