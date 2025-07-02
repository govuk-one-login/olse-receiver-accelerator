# olse-receiver-accelerator

A reference repository to help accelerate the development of a GOV.UK One Login Signal Exchange Receiver. Detailed docs are available in the `/docs` directory

# Developing

## Getting started

Ensure that all your commits are [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification).

```bash
nvm use
npm install
```

- `npm run container:dev`: Run a live expressJS server that reloads when changes are made
- `npm run test:vendor`: Run the vendor tests
- `npm run test:unit`: Run the unit tests written by the implementor.
