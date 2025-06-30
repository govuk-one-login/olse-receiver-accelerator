# Table of Contents

- [Table of Contents](#table-of-contents)
- [About the container solution](#about-the-container-solution)
- [Getting started](#getting-started)
  - [Auth](#auth)

# About the container solution

The container example is for if you decide to deploy a receiver as a container.

# Getting started

The express example is under `examples/express-container` and the entry point to the server example is `examples/express-container/server.ts`. You must **copy** this entire directory before modifying the code for your use case as per the [development guidelines](README.md#development-guidelines).

## Auth

The authentication works by implementing the client credentials flow. The authentication mechanism issues `access_token` as a JWT which allows for stateless authentication, keeping the
