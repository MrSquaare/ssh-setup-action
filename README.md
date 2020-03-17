# ssh-setup-action
Setup SSH

## Usage

```
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

```
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

```
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