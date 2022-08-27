# Guidelines

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Git](#git)
  - [Branch](#branch)
    - [main](#main)
    - [develop](#develop)
    - [hot/](#hot)
    - [bug/](#bug)
    - [feature/](#feature)
  - [Commit](#commit)
- [Submission](#submission)
  - [Issue](#issue)
  - [Pull Request](#pull-request)

## Code of Conduct

We adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as the [Code of Conduct](CODE_OF_CONDUCT.md) of our projects.

## Git

### Branch

We have adopted rules on the use and nomenclature of branches. These rules are inspired from the [Gitflow](https://nvie.com/posts/a-successful-git-branching-model) and [GitHub flow](https://guides.github.com/introduction/flow) workflows.

#### main

This branch contains the latest stable version.
This branch is subject to restrictions.

#### develop

This branch contains the version under development.
This branch is subject to restrictions.

It is created from and merge in `main`.

#### hot/

These branches correspond to the correction of a critical bug.

They are created from and merge in `main`.

#### bug/

These branches correspond to the correction of a bug.

They are created from and merge in `develop`.

#### feature/

These branches correspond to the development of a feature or an improvement.

They are created from and merge in `develop`.

### Commit

We have adopted the [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) as our commit message standard. It helps maintain a clear and accurate history of changes made.

## Submission

### Issue

Before submitting a new issue, make sure there are no similar ones to yours, open or not. If a similar issue exists, comment only if you have additional information that would be useful in resolving it. If not, [open a new issue](https://help.github.com/en/github/managing-your-work-on-github/creating-an-issue) and follow the template steps.

### Pull Request

Before submitting a new pull request, make sure there are no existing features or pull requests similar to yours. If a similar pull request exists, contribute only if you have useful features to add to it. If not, follow these steps:

1. Open a new issue by following the [Issue](#issue) section
2. [Fork the repository](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
3. Create a new branch by following the [Branch](GUIDELINES.md#branch) section of the [Git Guidelines](GUIDELINES.md#git)

```shell script
git checkout -b <branch-name>
```

4. Make your changes by following the project Code Guidelines
5. Commit your changes by following the [Commit](GUIDELINES.md#commit) section of the [Git Guidelines](GUIDELINES.md#git)
6. Push your branch

```shell script
git push <branch-name>
```

7. [Create a new pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork) and follow the template steps.
