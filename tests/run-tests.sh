#!/bin/bash

# This script will only run in AWS Codepipeline. It has access to the following environment variables:
# CFN_<OUTPUT-NAME> - Stack output value (replace <OUTPUT-NAME> with the name of the output)
# TEST_REPORT_ABSOLUTE_DIR - Absolute path to where the test report file should be placed
# TEST_REPORT_DIR - Relative path from current directory to where the test report file should be placed
# TEST_ENVIRONMENT - The environment the pipeline is running the tests in

# This file needs to be located at the root when running in the container. The path /test-app is defined
# in the Dockerfile.
cd /test-app || exit 1

if [ "$TEST_ENVIRONMENT" == "build" ]; then
  npm run test:vendor:build
  TESTS_EXIT_CODE=$?
elif [ "$TEST_ENVIRONMENT" == "staging" ]; then
  npm run test:vendor:staging
  TESTS_EXIT_CODE=$?
else
  echo "No Test Environment Set"
  exit 1
fi

# cp tests/reports/results/junit.xml $TEST_REPORT_ABSOLUTE_DIR/junit.xml
exit $TESTS_EXIT_CODE
