# ssh-setup-action
Setup SSH

![Pull Request](https://github.com/MrSquaare/ssh-setup-action/workflows/Pull%20Request/badge.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8c87d5e7a3c14640a874b228fbeb95a7)](https://www.codacy.com/manual/MrSquaare/ssh-setup-action?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=MrSquaare/ssh-setup-action&amp;utm_campaign=Badge_Grade)
![Dependabot](https://badgen.net/dependabot/MrSquaare/ssh-setup-action/?icon=dependabot)

## Usage

```yaml
name: Example

on: [push]

jobs:
  example:
    name: Example
    runs-on: ubuntu-latest
    steps:
    - name: Setup SSH
      uses: MrSquaare/ssh-setup-action@v1
      with:
        host: github.com
        private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

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
      uses: MrSquaare/ssh-setup-action@v1
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
      uses: MrSquaare/ssh-setup-action@v1
      with:
        host: github.com
        private-key: ${{ secrets.SSH_PRIVATE_KEY_GITHUB }}
        private-key-name: github
    - name: Setup GitLab SSH
      uses: MrSquaare/ssh-setup-action@v1
      with:
        host: gitlab.com
        private-key: ${{ secrets.SSH_PRIVATE_KEY_GITLAB }}
        private-key-name: gitlab
    - name: Clone GitHub repository
      run: git clone git@github.com:username/repository.git
    - name: Clone GitLab repository
      run: git clone git@gitlab.com:username/repository.git
```