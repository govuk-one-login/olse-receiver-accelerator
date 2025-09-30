# Mock SET Verification API (Mock Transmitter)

This directory contains the Mock SET Verification API (mock transmitter) which is used in the testing of the Lambda implementation. It authenticates using Cognito, signs, and sends a SET of the type 'Verification' to the receiver. For a detailed technical guide, see [`docs/lambda-solution.md`](../../../../docs/lambda-solution.md#mock-set-verification-api-mock-transmitter).

## Quick Start

1. **Install dependencies:**
2. **Set up environment variables:**
3. **Run tests:**

## Architecture Overview

- **API Gateway**: Custom authorizer for authentication
- **Cognito User Pool**: OAuth2 authentication for transmitter
- **Lambda Functions**: Processes verification requests and exposes JWKS endpoint
- **KMS**: Signs JWTs for verification SETs

## Core Infrastructure Components

Contaiend by `template.yaml`:

- **Cognito Resources:**
  - `SetMockTxApiUserPool`
  - `SetMockTxApiUserPoolClient`
  - `SetMockTxApiResourceServer`
  - `SetMockTxApiUserPoolDomain`
- **API Gateway:**
  - `MockTxVerfApiGateway`
  - `JwksApiGateway`
- **Lambda Functions:**
  - `MockVerfTxEventFunction`
  - `MockVerfTxJWKSEndpointFunction`
- **KMS:**
  - `MockTxKMSKey`
- **Secrets:**
  - `SetMockTxApiSecret`

## Lambda Functions

- **MockVerfTxEventFunction**: Handles POST /verify, builds and signs verification SETs, delivers to receiver endpoint.
- **MockVerfTxJWKSEndpointFunction**: Handles GET /jwks, exposes KMS public key for JWT verification.

See [`docs/lambda-solution.md`](../../../../docs/lambda-solution.md#mock-set-verification-api-mock-transmitter) for detailed function breakdowns and file locations.

## Request Flow

1. Client sends credentials to the transmitter
2. API Gateway authorizer validates with Cognito
3. Handler builds a `Verification` SET
4. KMS signs the JWT
5. Transmitter sends the SET to the receiverer

## API Endpoints

- **POST /verify**: Processes verification requests
- **GET /jwks**: Returns KMS public key for signature verification

## Environment Variables

Set the following environment variables before running locally or deploying:

- `AWS_REGION`: AWS region for KMS and Cognito services
- `KMS_KEY_ID`: Key ID for signing verification JWTs
- `RECEIVER_SECRET_ARN`: Secret ARN for authenticating to the receiver (used to fetch Cognito credentials)
- `AWS_STACK_NAME`: Name of the stack, used to resolve the receiver endpoint from SSM

See [`docs/lambda-solution.md`](../../../../docs/lambda-solution.md#mock-tx-environment-variable-configuration-parameters) for more details.

## Testing

For detailed setup and run instructions for integration tests, see the main [`README.md`](../../../../README.md) and [`docs/lambda-solution.md`](../../../../docs/lambda-solution.md#testing).
