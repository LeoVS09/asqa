# Asqa / Core

Core bot logic service, abstracted from specific messangers or platforms.

## Description

Sevice in general contain all bot use cases abstracted from platform services, search engine, and answer model.

## Quick Start

You can start service in docker, which is prefered, for have connection to other services in monorepo.

```bash
# In upper folder run for start console inside container
$ make bot-console

# Docker will map your local folder to this container

# Install dependencies
$ yarn install

# Then just start service in dev mode
$ yarn run start:dev
```

Or you can start service on your machine

```bash
# Firstly install dependencies
$ yarn install

# Start sevices on which depend Core servrice
# Change .env for match urls to services

# Then just start service in dev mode
$ yarn run start:dev
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
