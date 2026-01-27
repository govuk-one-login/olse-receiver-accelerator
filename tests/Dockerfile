ARG ALPINE_VERSION=3.21
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder

WORKDIR /build-app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci


FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS run-tests

RUN apk update && \
      apk upgrade && \
      apk add --no-cache \
      bash \
      aws-cli \
      mandoc \
      curl

RUN addgroup -S appgroup && \
    adduser -S -G appgroup appuser

WORKDIR /test-app

COPY --from=builder --chown=appuser:appgroup /build-app/node_modules ./node_modules

COPY --chown=appuser:appgroup tests/run-tests.sh /
COPY --chown=appuser:appgroup package.json package-lock.json tsconfig.json ./

COPY --chown=appuser:appgroup tests ./tests
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup examples ./examples

RUN chmod +x /run-tests.sh
WORKDIR /test-app/tests

USER appuser

ENTRYPOINT ["/run-tests.sh"]
