# olse-receiver-accelerator

A reference repository to help accelerate the development of a GOV.UK One Login Signal Exchange Receiver. This repo is maintained by the Signal Exchange Team and users are expected to create a fork of this repo. Detailed docs are available in the [docs](docs/README.md) directory.

# Developing

## Getting started

Ensure that all your commits are [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification) and that you use the node version as specified in `package.json` and `.nvmrc`

```bash
nvm use # sets the correct node version using [nvm](https://github.com/nvm-sh/nvm)
npm install # install npm dependencies
npm run prepare # setup pre-commit hooks
```

- `npm run container:dev`: Run a live expressJS server that reloads when changes are made
- `npm run vendor:test`: Run the vendor tests
- `npm run test:unit`: Run the unit tests for the user of the repo

# Issues, feature requests and contributions

Feel free to raise issues, feature request and contribute using the standard GitHub best practices. If you are a user of GOV.UK One Login, then you can also talk to your engagement manager.

# For Signal Exchange Team

Follow these guidelines when making changes to the repository

1. Adhere to the detailed docs above
2. use [semantic versioning](https://semver.org/)
3. Make appropriate updates to the changelog
