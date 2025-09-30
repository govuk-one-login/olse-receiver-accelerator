# One Login Signal Exchange receiver (OLSE) accelerator

A reference repository to help accelerate the development of a GOV.UK One Login Signal Exchange Receiver. This repo is maintained by the Signal Exchange Team and users are expected to create a fork of this repo. Detailed docs are available in the [docs](docs/README.md) directory.

# Developing

## Getting started

Ensure that all your commits are [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification) and that you use the node version as specified in `package.json` and `.nvmrc`

```bash
nvm use # sets the correct node version using [nvm](https://github.com/nvm-sh/nvm)
npm install # install npm dependencies
npm run prepare # setup pre-commit hooks
```

- `npm run container:dev`: Run a live expressJS server that reloads when changes are made
- `npm run vendor:test`: Run the vendor tests
- `npm run test:unit`: Run the unit tests for the user of the repo

# How to contribute to the One Login Signal Exchange receiver accelerator

Feel free to raise issues, feature request and contribute using the standard GitHub best practices. If you are a user of GOV.UK One Login, then you can also talk to your engagement manager.

# For Signal Exchange Team

Follow these guidelines when making changes to the repository

1. Adhere to the detailed docs above
2. Use [semantic versioning](https://semver.org/)
3. Make appropriate updates to the changelog

# Further Documentation and Examples

- **AWS Lambda Example:** See [`docs/lambda-solution.md`](docs/lambda-solution.md) for information on the AWS Lambda solution.
- **Container Example:** See [`docs/container-solution.md`](docs/container-solution.md) for information on the ExpressJS/container-based solution.
- **Logging:** See [`common/logging/logger.md`](common/logging/logger.md) for usage and configuration of the logging utilities.
- **Configuration:** See [`common/config/config.md`](common/config/config.md) for configuration options and environment variable details.

# Integration Testing

Integration tests are located in `tests/vendor/build/aws-lambda/integrationTests/`.

## Prerequisites

- Run `npm install` to install dependencies
- Set required environment variables (see below)
- **You must export and set AWS credentials so the tests can access and hit your AWS stack.**

Set these before running tests:

```sh
export AWS_ACCESS_KEY_ID=access-key-id
export AWS_SECRET_ACCESS_KEY=secret-access-key
export AWS_DEFAULT_REGION=region

# For receiver integration tests
export RECEIVER_ENDPOINT='https://receiver-endpoint'
export RECEIVER_SECRET_ARN='receiver-secret-arn'

# For verification integration tests
export VERIFICATION_ENDPOINT='https://verification-endpoint'
export JWKS_ENDPOINT='https://jwks-endpoint'
export MOCK_TX_SECRET_ARN='mock-tx-secret-arn'

export KMS_KEY_ID='kms-key-id'
export AWS_REGION='eu-west-2
```

## Running Tests

To run all integration tests:

```sh
npm run test:vendor:build
```

## Configuration

- Jest config: `tests/vendor/build/build.jest.config.mjs`

## Troubleshooting

- Ensure correct aws access credentials are set (they rotate)
- Ensure all required environment variables are set
- Review test logs for errors
