# AWS Lambda Signal Exchange Receiver

This directory contains the AWS Lambda implementation of the One Login Signal Exchange Receiver, including infrastructure as code and Lambda functions.

## Architecture Overview

The solution consists of:

- **API Gateway**: REST API endpoint for receiving signals
- **Cognito User Pool**: OAuth2 authentication for signal senders
- **Lambda Functions**: Signal processing and utility functions
- **Secrets Manager**: Secure storage of Cognito credentials

## Infrastructure Components

### CloudFormation Template (`template.yaml`)

#### Parameters

- `Environment`: Deployment environment (dev/build/staging)
- `CodeSigningConfigArn`: Lambda code signing configuration
- `PermissionsBoundary`: IAM permissions boundary

#### Cognito Resources

- **SSrUserPool**: User pool for OAuth2 authentication
- **SSrSignalResourceServer**: Resource server with `signal/post` scope. This allows us to authenticate with an Access Token instead of an ID Token.
- **SSrUserPoolClient**: Client credentials flow configuration
- **SSrSecret**: Encrypted storage of Cognito credentials

#### API Gateway

- **SharedSignalsApi**: REST API with Cognito authorization
- **SharedSignalsApiAccessLogGroup**: CloudWatch logs for API access

#### Lambda Functions

- **ReceiverFunction**: This will be the main signal processing function
- **GoodbyeFunction**: Example function, returns goodbye. AWS complains if you only have one function in your Api. Can be replaced with something useful in the next ticket.

## Lambda Functions

### Receiver Function (`src/lambda/receiver/`)

This will be the main signal processing function that handles incoming signal events. At the moment it doesnt do anything, except act as the function which is behind the cognito authorizer.

#### Files:

- **`handler.ts`**: Main Lambda handler
  - Processes API Gateway events
  - Returns JSON responses
  - Includes error handling

- **`getSecrets.ts`**: Secrets Manager integration
  - Retrieves Cognito credentials from Secrets Manager
  - Supports dynamic secret ARN resolution
  - Includes fallback mechanisms for local development

- **`getTokenFromCognito.ts`**: OAuth2 token management
  - Implements client credentials flow
  - Fetches access tokens from Cognito
  - Uses stored client credentials

#### Environment Variables:

- `SECRET_ARN`: ARN of the Secrets Manager secret containing Cognito credentials
- `API_GATEWAY_URL`: URL for the API Gateway

#### IAM Permissions:

- `secretsmanager:GetSecretValue` on the SSrSecret resource

### Goodbye Function (`src/lambda/goodbye/`)

Simple utility function for testing and demonstration purposes.

#### Files:

- **`handler.ts`**: Basic Lambda handler that returns a goodbye message

## Cloud Environment

Currently the lambdas are deployed into a VPC and the permissions dont exist to support this. At the moment you need to manually remove the Lambda from the VPC and then make and push a code change for them to work. This is something we need to revisit.

## Local Development

```bash

# You will need to manually set the SECRET_ARN and API_GATEWAY_URL environment variablea in order to run intergration tests locally

# Log into shared-signals-dev account and get it manually from AWS Secrets Manager, under (branch-name)-ssr-secrets
export SECRET_ARN='insert secret ARN here'

# Log into shared-signals-dev account and get it manually from AWS API Gateway for your branch, under (branch-name-shared-signals-receiver-api-endpoint, go to stages, expand down to the function, then its the invoke url
export API_GATEWAY_URL='insert api gateway url here'
```

## Security Features

- **KMS Encryption**: All secrets and logs encrypted with customer-managed keys
- **OAuth2 Authentication**: Cognito-based authentication with scoped access
- **Code Signing**: Optional Lambda code signing support
- **Permissions Boundary**: IAM permissions boundary support

## API Endpoints

### POST /api/v1/Events

- **Purpose**: Receive signal exchange events
- **Authentication**: OAuth2 Bearer token with `signal/post` scope
- **Handler**: ReceiverFunction
- **Request**: JSON payload containing signal data
- **Response**: JSON acknowledgment

## Configuration Files

### `samconfig.toml`

SAM deployment configuration with environment-specific parameters.

## Monitoring and Logging

- **CloudWatch Logs**: Automatic logging for all Lambda functions
- **API Gateway Access Logs**: Detailed request/response logging
- **X-Ray Tracing**: Distributed tracing enabled on API Gateway

## Testing

Integration tests are located in `src/lambda/receiver/handler.test.ts` and can be run with:

```bash
npm run test:vendor:build
```
