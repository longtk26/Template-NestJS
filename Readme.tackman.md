## 🧾 Project: Tackman

## Table of Contents

1. [Introduction](#introduction)
2. [Technologies used](#technologies-used)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Run the project (development)](#run-the-project-development)
6. [Scripts](#scripts)
7. [API Documentation](#api-documentation)
8. [Committing your code](#committing-your-code)

## Introduction

**Tackman** is a web application designed to provide knowledge and learning materials to employees working in the railway industry. It aims to support staff training by organizing educational content in an accessible and structured manner.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, scalable server-side applications.
- **Node.js**: Version >= 20
- **PostgreSQL**: Version 16

## Prerequisites

- Node.js (v20+)
- Docker
- PostgreSQL (v16+)

## Installation

### Node

We are using `v20.19.0` version for Node, We strongly recommend you to use [nvm](https://github.com/nvm-sh/nvm) to manage multiple node version.

```shell
# install node version
nvm install 20.19.0
# if you already have
nvm use 20.19.0
# optional, set to default
nvm alias default 20.19.0
```

### Bun

This project uses `bun v1.2.5` for managing its packages.
To install [bun](https://bun.sh/docs/installation), please select one of the following installation methods:

Using a standalone script

```shell
curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL
```

On Windows (PowerShell):

```shell
powershell -c "irm bun.sh/install.ps1|iex"
```

## Run the project (development)

### Step 1: Install packages:

```bash
bun i
```

### Step 2: Prepare env file and set correct variables

```bash
cp .env.default .env
```

### Step 3: Run docker-compose file to start database and mailhog in development

```bash
# Need to comment app service in docker-compose file to only run database and mailhog
docker compose up -d
```

### Step 3: Run migration to generate prisma client and tables in database

```bash
bun run prisma:migratedev
```

### Step 4: Start application

```bash
bun run start:dev
```

### Scripts

```bash
# Development
bun run start:dev

# Production build
bun run build
bun start:prod

# Database
bun prisma:migratedev # Run migrations and generate prisma client

# Testing
bun test # Run unit tests
bun test:watch # Run unit tests in watch mode
bun test:cov # Run tests with coverage
bun test:e2e # Run e2e tests
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:<port>/api/v1/docs
```

## Committing your code

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to automatically determine how the version should be updated. For a detailed version, see the link. Please note these correlate with semver.

For a patch, use fix/tackman#{issue-number}: description here

For a minor update, use feat/tackman#{issue-number}: description here

For a major or breaking update, use epic/tackman#{issue-number}: description here

For a hotfix, use hotfix/tackman#{issue-number}: description here

Examples:

- fix/tackman#123: Small patch description
- feat/tackman#123: Minor issues fix description
- epic/tackman#123: Major breaking update description
- hotfix/tackman#123: Hotfix description
