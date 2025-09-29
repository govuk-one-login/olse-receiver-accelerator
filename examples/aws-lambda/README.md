# AWS Lambda Signal Exchange Receiver

This directory contains the AWS Lambda implementation of the One Login Signal Exchange Receiver, including infrastructure as code and Lambda functions. For a detailed technical guide, see [`docs/lambda-solution.md`](../../docs/lambda-solution.md).

## Quick Start

1. **Install dependencies:**
2. **Copy the example directory:**
3. **Set up environment variables:**
4. **Run tests:**

## Architecture Overview

- **API Gateway**: REST API endpoint for receiving signals
- **Cognito User Pool**: OAuth2 authentication for signal senders
- **Lambda Functions**: Signal processing and utility functions
- **Secrets Manager**: Secure storage of Cognito credentials

## Core Infrastructure Components

Contained in`template.yaml`:

- **Cognito Resources:**
  - `SSrUserPool`
  - `SSrSignalResourceServer`
  - `SSrUserPoolClient`
  - `SSrSecret`
- **API Gateway:**
  - `SharedSignalsApi`
- **Lambda Functions:**
  - `ReceiverFunction`
  - `HealthCheckFunction`
  - `GetJwksFunction`
- **Secrets:**
  - `SSrSecret`

## Lambda Functions

- **ReceiverFunction**: Main handler for processing incoming Security Event Tokens (SETs) and routing signals.
- **HealthCheckFunction**: Handler for health check requests and verification signal logic.
- **GetJwksFunction**: Handler for exposing JWKS endpoint.

See [`docs/lambda-solution.md`](../../docs/lambda-solution.md) for detailed function breakdowns and file locations.

## Local Development

Set the following environment variables before running locally or running integration tests:

```bash
export RECEIVER_SECRET_ARN='receiver_secret_arn'
export MOCK_TX_SECRET_ARN='mock_tx_secret_arn'
export AWS_STACK_NAME='stack_name'
```

See [`docs/lambda-solution.md`](../../docs/lambda-solution.md#local-development) for more details.

## Security Features

- **KMS Encryption**: All secrets and logs encrypted with customer-managed keys
- **OAuth2 Authentication**: Cognito-based authentication with scoped access
- **Code Signing**: Optional Lambda code signing support
- **Permissions Boundary**: IAM permissions boundary support

## API Endpoints

### POST /api/v1/Events

- **Purpose**: Receive SET events
- **Authentication**: OAuth2 Bearer token
- **Handler**: ReceiverFunction
- **Request**: JSON payload containing signal data
- **Response**: JSON acknowledgment

## Configuration Files

- `samconfig.toml`: SAM deployment configuration with environment-specific parameters.

## Monitoring and Logging

- **CloudWatch Logs**: Automatic logging for all Lambda functions
- **API Gateway Access Logs**: Detailed request/response logging

## Testing

For detailed setup and run instructions for integration tests, see the main [`README.md`](../../README.md) and [`docs/lambda-solution.md`](../../docs/lambda-solution.md#testing).
