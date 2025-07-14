# Table of Contents

- [Table of Contents](#table-of-contents)
- [About the container solution](#about-the-container-solution)
- [Getting started](#getting-started)
  - [Auth](#auth)
  - [Payload Validation](#payload-validation)
  - [Signal Validation](#signal-validation)
  - [Signal routing](#signal-routing)
  - [Verification Signal](#verification-signal)

# About the container solution

The container example is for if you decide to deploy a receiver as a container.

# Getting started

The express example is under `examples/express-container` and the entry point to the server example is `examples/express-container/server.ts`. You must **copy** this entire directory before modifying the code for your use case as per the [development guidelines](README.md#development-guidelines).

## Auth

The authentication works by implementing the client credentials flow. The authentication mechanism issues `access_token` as a JWT which allows for stateless authentication. On a protected endpoint the endpoint will have `access_token` as part of the auth header which can then be validated as a JWT.

## Payload Validation

The payload in the HTTP request body will be a Security Event Token (SET). A SET is a JWT so can be validated as a JWT. Unlike Auth, the public key is provided by the GOV.UK One Login Signal Exchange Transmitter.

## Signal Validation

After the request body has been decoded and validated as a JWT, you will have the Seurity Event Token (SET) which can then be validated furtger. The Signal Exchange Team can provide json schemas to make validation simpler.

## Signal routing

At this point the signal is valid and can then be processed by your upstream processes. Signal routing is ensureing that is routed to the appropriate location. The signal routing follows the following process:

1. Event Type Detection: Identify the RISC event type from the events object on the SetPayload
2. Routes to appropriate handler based on event type within `signal-handlers.ts`
3. Response: Returns success or failure status

Supported Event Types

Currently for example purposes the signal routing supports the following event types:

- Account Disabled
- Account Purged

Signal Handlers
There are two boiler plate examples of the signal handlers that can be found in `examples/express-container/signal-routing/signal-handlers.ts`. These currently return a `SignalResult` object, however the intention is for these to be used to fulfil the end to end use case integration for example taking immediate action in the event of `Account Disabled` or `Account Purged` etc. This may require external integrations for example but not limited to sending signals to HTTP APIs, an AWS Lambda Invocation or sending on to a message queue. This logic is intended for the RP to implement by themselves depending on their requirements.

Error Handling

The signal routing handles several error cases:

| Error Code.            | Description                 | Action                        |
| ---------------------- | --------------------------- | ----------------------------- |
| MISSING_EVENTS.        | No events filed in payload  | Return 400 with error message |
| UNSUPPORTED_EVENT_TYPE | Unknown event type received | Return 400 with error message |
| Failed to process      | Handler execution failed    | Return 500 with error message |

Implementation steps for handling new/additional signals

1. Update Enums: Add new event type to `RiscEventType` enum
2. Create handler: Implement the specific event handler function
3. Add Route Case: Include the new case in the switch statement

Signal Routing Process Output

The signal routing process produces two standardized responses in accordance with RFC 8935:

Success Response

HTTP 202 Accepted
`{}`

Error Response

HTTP 400 Bad Request
`{
  "success": false,
  "errorCode": "UNSUPPORTED_EVENT_TYPE",
  "message": "Unsupported event type"
}`

## Verification Signal

The container will have a basic cron job that will attempt to call the Signal Transmitter's Verification signal every 15 minutes. The payload for the `state` field will be a JWT so that when the receiver receives the verification signal sent by the transmitter, the recevier can verify the signal.
