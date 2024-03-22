# Contributing

## Table of Contents

- [Guidelines](#guidelines)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Building](#building)
- [Testing](#testing)

## Guidelines

See [GUIDELINES.md](GUIDELINES.md) for more information.

## Getting started

### Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [pnpm](https://pnpm.io/installation)
3. Install [act](https://github.com/nektos/act#installation)

### Installation

1. Clone the repository:

```shell script
git clone https://github.com/MrSquaare/ssh-setup-action.git
```

2. Install dependencies:

```shell script
pnpm install
```

## Building

Build the project:

```shell script
pnpm build
```

## Testing

Lint the code:

```shell script
pnpm lint
```

Format the code:

```shell script
pnpm format
```

Run workflows with [act](https://github.com/nektos/act):
```
act pull_request
```

**Note**: You will need to adapt the existing workflows
