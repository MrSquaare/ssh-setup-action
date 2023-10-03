# ssh-setup-action

Setup SSH

![Release](https://badgen.net/github/release/MrSquaare/ssh-setup-action?icon=github)
[![Codacy](https://app.codacy.com/project/badge/Grade/88adcccc19804fe6969e053d690a2b1d)](https://www.codacy.com/gh/MrSquaare/ssh-setup-action/dashboard)

## Table of Contents

- [About](#about)
- [Using](#using)
- [Environment variables](#environment-variables)
- [Outputs](#outputs)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## About

This GitHub action helps you to setup SSH.

It support Node.js 20+ for Linux and macOS runners.

## Using

```yaml
name: Example

on: [push]

jobs:
  example:
    name: Example
    runs-on: ubuntu-latest
    steps:
    - name: Setup SSH
      uses: MrSquaare/ssh-setup-action@v3
      with:
        host: github.com
        private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

## Environment variables

This action exports the following environment variables:

- `SSH_PATH`: Path to SSH directory
- `SSH_AGENT_PID`: PID of SSH agent
- `SSH_AUTH_SOCK`: Path to SSH agent socket

## Outputs

This action set the following outputs:

- `ssh-path`: Path to SSH directory
- `ssh-agent-pid`: PID of SSH agent
- `ssh-auth-sock`: Path to SSH agent socket

## Examples

### Single key and clone

```yaml
name: Clone repository

on: [push]

jobs:
  clone:
    name: Clone
    runs-on: ubuntu-latest
    steps:
    - name: Setup SSH
      uses: MrSquaare/ssh-setup-action@v3
      with:
        host: github.com
        private-key: ${{ secrets.SSH_PRIVATE_KEY }}
    - name: Clone repository
      run: git clone git@github.com:username/repository.git
```

### Multiple keys and multiple clone

```yaml
name: Clone repositories

on: [push]

jobs:
  clone:
    name: Clone
    runs-on: ubuntu-latest
    steps:
    - name: Setup GitHub SSH
      uses: MrSquaare/ssh-setup-action@v3
      with:
        host: github.com
        private-key: ${{ secrets.SSH_PRIVATE_KEY_GITHUB }}
        private-key-name: github
    - name: Setup GitLab SSH
      uses: MrSquaare/ssh-setup-action@v3
      with:
        host: gitlab.com
        private-key: ${{ secrets.SSH_PRIVATE_KEY_GITLAB }}
        private-key-name: gitlab
    - name: Clone GitHub repository
      run: git clone git@github.com:username/repository.git
    - name: Clone GitLab repository
      run: git clone git@gitlab.com:username/repository.git
```

## Contributing

Bug reports, feature requests, other issues and pull requests are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

Distributed under the [MIT](https://choosealicense.com/licenses/mit/) License.
See [LICENSE](LICENSE) for more information.
