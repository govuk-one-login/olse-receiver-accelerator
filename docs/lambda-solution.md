# Table of Contents

- [Table of Contents](#table-of-contents)
- [About the lambda example](#about-the-lambda-example)
- [Getting started](#getting-started)
  - [Auth](#auth)
  - [Payload Validation](#payload-validation)
  - [Signal Validation](#signal-validation)
  - [Signal routing](#signal-routing)
  - [Verification Signal](#verification-signal)

# About the lambda example

The container example is for if you decide to deploy a receiver in AWS Lambda.

# Getting started

The lambda example is under `examples/aws-lambda`. You must **copy** this entire directory before modifying the code for your use case as per the [development guidelines](README.md#development-guidelines).

## Auth

The authentication works by implementing the client credentials flow. The authentication mechanism uses AWS API Gateway with AWS Cognito to authenticate the request.

## Payload Validation

The payload in the body will be a Security Event Token (SET). A SET is a JWT so can be validated as a JWT. Unlike Auth, the public key is provided by the GOV.UK One Login Signal Exchange Transmitter.

The code for this will only be ran after auth.

## Signal Validation

After the Payload has been decoded and validated as a JWT, it can then be validated. The Signal Exchange Team can provide json schemas to make validation simpler.

## Signal routing

At this point the signal is valid and can then be processed by your upstream processes. Signal routing is ensureing that is routed to the appropriate location.

## Verification Signal

AWS Eventbridge will trigger a lambda that will attempt to call the Signal Transmitter's Verification signal every 15 minutes. The payload for the `state` field will be stored in AWS DynamoDB so that, when the receiver receives the verification signal sent by the transmitter, the receiver can verify the signal by looking up the value of `state` in the DynamoDB table.
