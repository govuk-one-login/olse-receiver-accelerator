# Table of Contents

- [Table of Contents](#table-of-contents)
- [About the container solution](#about-the-container-solution)
- [Getting started](#getting-started)
  - [Auth](#auth)
  - [Payload Validation](#payload-validation)
  - [Signal Validation](#signal-validation)
  - [Signal routing](#signal-routing)

# About the container solution

The container example is for if you decide to deploy a receiver as a container.

# Getting started

The express example is under `examples/express-container` and the entry point to the server example is `examples/express-container/server.ts`. You must **copy** this entire directory before modifying the code for your use case as per the [development guidelines](README.md#development-guidelines).

## Auth

The authentication works by implementing the client credentials flow. The authentication mechanism issues `access_token` as a JWT which allows for stateless authentication. On a protected endpoint the endpoint will have `access_token` as part of the auth header which can then be validated as a JWT.

## Payload Validation

The payload in the body will be a Security Event Token (SET). A SET is a JWT so can be validated as a JWT. Unlike Auth, the public key is provided by the GOV.UK One Login Signal Exchange Transmitter.

## Signal Validation

After the Payload has been decoded and validated as a JWT, it can then be validated. The Signal Exchange Team can provide json schemas to make validation simpler.

## Signal routing

At this point the signal is valid and can then be processed by your upstream processes. Signal routing is ensureing that is routed to the appropriate location.
