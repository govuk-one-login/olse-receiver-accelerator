# Table of Contents

- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [Application Development Approaches](#application-development-approaches)
  - [Container](#container)
  - [AWS native](#aws-native)
  - [Alternative approaches](#alternative-approaches)
- [Development guidelines](#development-guidelines)
  - [Directory Structure](#directory-structure)
  - [Release Management](#release-management)
- [Next Steps](#next-steps)

# Getting Started

These docs serve as a guidance on how to work with this repository to help with developement of the receiver.

# Application Development Approaches

This repository provides two approaches to develop with the receiver while adhering to [RFC 8935](https://www.rfc-editor.org/rfc/rfc8935.html) (ensure that you read the RFC).

## Container

Under the `examples` directory, we provide a sample [ExpressJS](https://expressjs.com/) implementation of the receiver. This is designed to be an _"environment agnostic"_ implementation of the receiver by deploying the ExpressJS server in a docker container.

## AWS native

Under the `examples` directory, there is also an example implementation using AWS cloud native technologies such as AWS API Gateway, AWS Lambda, AWS cognito etc.

## Alternative approaches

If the approaches above do not meet your needs, you can always use the examples to drive the development of an approach that meets you technology stack. Just ensure that you adhere to [RFC 8935](https://www.rfc-editor.org/rfc/rfc8935.html) as well as the standard setout by the Signal Exchange Team.

# Development guidelines

We recommend that you create a [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks) of this repository and then extend the receiver to suit your needs. The forking model allows you to use the existing code that the Signal Exchange Team wrote whilst allowing you add functionality specific to your needs. If the Signal Exchange Team releases an update to the repository, you can [sync the fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) to get the latest changes using the Github UI or git.

## Directory Structure

Any directories

- `examples/*` - used to store examples
- `*/vendor/*` - common and useful code

Are directories that should not be modified as they are maintained by the Signal Exchange Team. When an update is released, files within these directories will be modified so when you attempt to sync the repository, you should not run into any merge conflicts

## Release Management

The Signal Exchange Team will use [semantic versioning](https://semver.org/) across the repository as well as use Git Tags and changelogs to help with release change and management. The Signal Exchange Team will try to minimise the number of breaking changes but when it is not possible, we will give plenty of notice and provide a migration pathway with minimal disruption.

# Next Steps

Next you should look at the docs that explains the examples, how they work and what work that needs to be done to make the examples useful. See

- [container-solution.md](container-solution.md) to see how the container example works and how it can be modified.
- [lambda-solution.md](lambda-solution.md) to see how the lambda based example works and how it can be modified
