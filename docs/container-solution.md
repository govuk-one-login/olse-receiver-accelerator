# About the Container Solution

This document details the high-level overview and implementation guide for the ExpressJS/container-based OLSE receiver.

## Table of Contents

- [About the Container Solution](#about-the-container-solution)
- [Getting Started](#getting-started)
- [Auth](#auth)
- [Payload Validation](#payload-validation)
- [Signal Validation](#signal-validation)
- [Signal Routing](#signal-routing)
- [Verification Signal](#verification-signal)
- [Core Components](#core-components)
- [Local Development](#local-development)
- [API Endpoints](#api-endpoints)
- [Configuration Files](#configuration-files)
- [Monitoring and Logging](#monitoring-and-logging)
- [Testing](#testing)

## About the Container Solution

The container example demonstrates how to deploy an OLSE receiver as an ExpressJS container.

## Getting Started

The Express example is under `examples/express-container`. The entry point is `examples/express-container/server.ts`.

## Auth

Authentication uses the OAuth2 client credentials flow. The server issues an `access_token` (JWT) for stateless authentication. Protected endpoints require the `access_token` in the Authorization header.

## Payload Validation

The payload in the HTTP request body is a Security Event Token (SET), which is a JWT. The public key for validation is provided by the GOV.UK One Login Signal Exchange Transmitter.

## Signal Validation

After decoding and validating the JWT, the SET can be further validated against JSON schemas. The Signal Exchange Team can provide schemas to simplify this. See the `schemas` directory for an example schema for the [verification signal](https://openid.net/specs/openid-sharedsignals-framework-1_0.html#name-verification).

## Signal Routing

Once validated, the signal is routed to the appropriate handler. Routing follows this process:

1. Event type detection (based on matching JSON schema)
2. Routed to the handler in `signalRouting/signalHandlers.ts`
3. Returns success or failure based on handler output

## Verification Signal

The container includes a cron job that calls the Signal Transmitter's Verification endpoint every 15 minutes. The `state` field payload is a JWT (TODO: this will change as state field will no longer be a JWT), allowing the receiver to verify the [verification signal](https://openid.net/specs/openid-sharedsignals-framework-1_0.html#name-verification) sent by the transmitter.

## Core Components

- **Express Server**: Main entry point is `server.ts`
- **Auth**: Located in ``
- **Signal Handlers**: Located in `signalRouting/signalHandlers.ts`
- **Schema Validation**: Example schemas in `schemas/`
- **Health Check**: Logic in `verification/startHealthCheck.ts`

## Local Development

Set the following environment variables before running locally or running tests:

```bash
export JWKS_URL='jwks_url'
export AUTH_PRIVATE_KEY_PATH='./keys/authPrivate.key'
export AUTH_PUBLIC_KEY_PATH='./keys/authPublic.key'
```

See this file and the main `README.md` for more details.

## API Endpoints

### POST /v1/Events

- **Purpose**: Receive SET events
- **Authentication**: OAuth2 Bearer token
- **Request**: JWT in the request body
- **Response**: 202 on success, 400/500 on error

### POST /v1/token

- **Purpose**: Issue access tokens (client credentials flow)
- **Request**: Form-encoded client credentials
- **Response**: Access token (JWT)

### GET /v1/health-check

- **Purpose**: Health check endpoint
- **Response**: 200 if healthy

## Configuration Files

- `server.ts`: Main Express server entry point
- `signalRouting/signalHandlers.ts`: Signal routing logic
- `schemas/`: JSON schemas for validation

## Monitoring and Logging

- **Console Logging**: All requests and errors are logged to the console

## Testing

For detailed setup and run instructions for integration tests, see the main `README.md` and this file.
