# About the lambda example

This example shows how to deploy OLSE receiver in AWS Lambda. This document details the high-level overview and the detailed implementation guide for the AWS Lambda-based OLSE receiver.

# Getting started

The lambda example is under `examples/aws-lambda`. You must **copy** this entire directory before modifying the code for your use case as per the [development guidelines](README.md#development-guidelines).

## Table of Contents

- [About the Lambda Example](#about-the-lambda-example)
- [Getting Started](#getting-started)
  - [Auth](#auth)
  - [Payload Validation](#payload-validation)
  - [Signal Validation](#signal-validation)
  - [Signal Routing](#signal-routing)
  - [Verification Signal](#verification-signal)
- [Infrastructure Components](#infrastructure-components)
- [Lambda Functions](#lambda-functions)
- [Cloud Environment](#cloud-environment)
- [Local Development](#local-development)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Configuration Files](#configuration-files)
- [Monitoring and Logging](#monitoring-and-logging)
- [Testing](#testing)
- [Troubleshooting & Error Reference](#troubleshooting--error-reference)
- [Maintenance](#maintenance)
- [References](#references)
- [Mock SET Verification API (Mock Transmitter)](#mock-set-verification-api-mock-transmitter)

## About the Lambda Example

This example shows how to deploy the OLSE receiver in AWS Lambda. The example includes three Lambda handlers:

- **healthCheck**: Handler for health check requests, useful for monitoring and readiness probes.
- **receiver**: Main handler for processing incoming Security Event Tokens (SETs) and routing signals.

Each handler is located in its own directory under `examples/aws-lambda/src/lambda/`.

## Architecture Overview

The solution consists of:

- **API Gateway**: REST API endpoint for receiving signals
- **Cognito User Pool**: OAuth2 authentication for signal senders
- **Lambda Functions**: Signal processing and utility functions
- **Secrets Manager**: Secure storage of Cognito credentials

## Getting Started

The Lambda example is under `examples/aws-lambda`. You must **copy** this entire directory before modifying the code for your use case, as per the development guidelines.

The main Lambda entry points are:

- `src/lambda/healthCheck/handler.ts`
- `src/lambda/receiver/handler.ts`

Each handler has an associated test file.

### Auth

Authentication follows the client credentials flow. The authentication mechanism uses AWS API Gateway with AWS Cognito to authenticate incoming requests to the Lambda functions.

### Payload Validation

The payload in the body is a Security Event Token (SET). A SET is a JWT and can be validated as such. Unlike Auth, the public key is provided by the GOV.UK One Login Signal Exchange Transmitter.

Payload validation is performed after authentication.

### Signal Validation

After the payload has been decoded and validated as a JWT, it is further validated against a JSON schema. The Signal Exchange Team can provide JSON schemas to make validation simpler.

### Signal Routing

Once the signal is validated, it can be processed by RP-specific upstream processes. Signal routing ensures that the valid signal is routed to the appropriate location for your application.

### Verification Signal

Every 15 minutes, AWS EventBridge triggers the health check Lambda, which sends a verification request with a `stream_id` and a `state` value to the mock transmitter. The mock transmitter validates that the `state` field, then includes it in the Security Event Token (SET) it generates and signs. The receiver validates the SET and routes the signal.

## Infrastructure Components

### Infrastructure Components

The following AWS resources are provisioned for the receiver solution:

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

### Receiver Function (`src/lambda/receiver/`)

This is the main signal processing function that handles incoming Security Event Tokens (SETs) as JWTs. It performs:

- Parsing and validation of the JWT in the request body
- Fetching the JWKS URL from SSM and retrieving the public key
- Validating the JWT signature and payload
- Validating the signal against schemas
- Routing the signal to the appropriate handler
- Returns appropriate HTTP status codes and error messages

#### Files:

- **`handler.ts`**: Main Lambda handler for processing incoming SETs
  - Validates JWT and payload
  - Handles schema validation and signal routing
  - Returns 202 (Accepted) on success, 400/500 on error
- **`handler.test.ts`**: Unit tests for the receiver handler

#### Environment Variables (Receiver Lambda):

- `RECEIVER_SECRET_ARN`: Secret ARN for authenticating to the receiver
- `AWS_STACK_NAME`: Name of the stack for SSM parameter lookup

#### Request/Response:

- **POST**: Expects a JWT in the request body
- **202**: Signal processed successfully
- **400**: Invalid request, JWT, or schema
- **500**: Internal error

### Health Check Function (`src/lambda/healthCheck/`)

This Lambda function is used for health checks and to trigger a verification signal to the mock transmitter. It:

- Fetches the verification endpoint URL from SSM
- Authenticates using Cognito and retrieves an access token
- Sends a verification request to the mock transmitter
- Returns 200 if the health check passes, 500 otherwise

#### Files:

- **`handler.ts`**: Lambda handler for health checks and verification signal
- **`handler.test.ts`**: Unit tests for the health check handler

#### Environment Variables (Health Check Lambda):

- `MOCK_TX_SECRET_ARN`: Secret ARN for authenticating to the mock transmitter
- `AWS_STACK_NAME`: Name of the stack for SSM parameter lookup

#### Request/Response:

- **POST**: Triggers a health check
- **200**: Health check passed
- **500**: Health check failed

## Cloud Environment

Currently the lambdas are not deployed into a VPC. This is something we need to revisit.

## Local Development

```bash
# You will need to manually set the following environment variables in order to run integration tests locally:

export RECEIVER_SECRET_ARN='receiver_secret_arn'
export MOCK_TX_SECRET_ARN='mock_tx_secret_arn'
export AWS_STACK_NAME='stack_name'
```

## API Endpoints

### POST /api/v1/Events

- **Purpose**: Receive SET events
- **Authentication**: OAuth2 Bearer token
- **Handler**: ReceiverFunction
- **Request**: JWT payload containing signal data
- **Responses:**
  - **202 Accepted**: Signal processed successfully
    - Body: _empty string_
  - **400 Bad Request**: Invalid JWT, schema validation failed, or payload missing
    - Body (invalid key):
      ```json
      {
        "err": "invalid_key",
        "description": "One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.)."
      }
      ```
    - Body (invalid request):
      ```json
      {
        "err": "invalid_request",
        "description": "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      }
      ```
    - Body (payload undefined):
      ```json
      {
        "err": "invalid_request",
        "description": "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
      }
      ```
  - **500 Internal Server Error**: Server error or missing environment variable
    - Body (missing RECEIVER_SECRET_ARN):
      ```json
      {
        "err": "internal_error",
        "description": "RECEIVER_SECRET_ARN environment variable is required"
      }
      ```
    - Body (unexpected error):
      ```json
      {
        "err": "internal_error",
        "description": "An internal error occurred"
      }
      ```

### POST /api/v1/health-check

- **Purpose**: Health check endpoint
- **Handler**: HealthCheckFunction
- **Responses:**
  - **200 OK**: Service is healthy
    - Body:
      ```json
      {
        "success": true,
        "status": 204,
        "message": "Health check passed"
      }
      ```
  - **500 Internal Server Error**: Health check failed
    - Body:
      ```json
      {
        "success": false,
        "status": 500,
        "message": "Health check failed"
      }
      ```

## Configuration Files

### `samconfig.toml`

SAM deployment configuration with environment-specific parameters.

## Monitoring and Logging

- **CloudWatch Logs**: Automatic logging for all Lambda functions
- **API Gateway Access Logs**: Detailed request/response logging

## Testing

For detailed setup and run instructions for integration tests, see the main `README.md`.

## Troubleshooting & Error Reference

See the runbook in confluence for detailed troubleshooting guidance

Common issues include:

- **401 Unauthorized**: Missing/invalid credentials or access token
- **400 Bad Request**: Malformed JWT, schema validation failed, or routing error
- **500 Internal Server Error**: Missing environment variables, JWKS URL issues, or unhandled exceptions
- **Health Check Fails**: Issues with mock transmitter endpoint, Cognito, or SSM

Refer to CloudWatch logs and the runbook for log messages and further diagnosis.

## Mock SET Verification API (Mock Transmitter)

This section describes the mock transmitter Lambda that authenticates using Cognito, signs, and sends a SET of the type 'Verification' to a receiver.

### Infrastructure Components

The following AWS resources are provisioned for the mockset verification API (mock transmitter):

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

### Components

- **Auth**: API Gateway custom authorizer
- **Process**: AWS Lambda to process Verification request
  - **Sign**: AWS KMS
  - **Delivery**: HTTP POST to receiver
- **Keys**: JWKS Endpoint exposes KMS public keys

### Request Flow

1. Client sends credentials to Transmitter
2. API Gateway authorizer validates with Cognito
3. Handler builds `Verification` SET
4. KMS signs JWT
5. Transmitter sends SET to receiver

### Endpoints

- `POST /verify`: Processes verification request
  - **204 No Content**: Verification SET delivered successfully
    - _Body_: _empty string_
  - **400 Bad Request**: Invalid request
    - _Body_:
      ```json
      {
        "error": "invalid_request",
        "error_description": "The request is missing required params or contains invalid values"
      }
      ```
  - **403 Forbidden**: Access denied
    - _Body_:
      ```json
      {
        "error": "access_denied"
      }
      ```
  - **500 Internal Server Error**: Server error
    - _Body_:
      ```json
      {
        "error": "server_error",
        "error_description": "An internal server error occured"
      }
      ```

- `GET /jwks`: JWKS to retrieve KMS public key for signature verification
  - **200 OK**: JWKS returned successfully
    - _Body_:
      ```json
      {
        "keys": [
          {
            /* Some object */
          }
        ]
      }
      ```
  - **500 Internal Server Error**: Server error
    - _Body_:
      ```json
      {
        "error": "INTERNAL_SERVER_ERROR",
        "error_description": "unexpected error occured"
      }
      ```

### Mock Tx Environment Variable Configuration Parameters

- `AWS_REGION`: AWS region config for KMS and Cognito services
- `KMS_KEY_ID`: Key id for signing Verification JWT
- `RECEIVER_SECRET_ARN`: Secret ARN for authenticating to the receiver (used to fetch Cognito credentials)
- `AWS_STACK_NAME`: Name of the stack, used to resolve the receiver endpoint from SSM

> Note: The receiver endpoint is resolved at runtime from SSM using the stack name, not directly from an environment variable.
