// oxlint-disable no-magic-numbers
import type { Context } from "aws-lambda";

export const mockLambdaContext: Context = {
  awsRequestId: "someRequestId",
  callbackWaitsForEmptyEventLoop: false,
  done: () => 1,
  fail: () => 1,
  functionName: "someFunction",
  functionVersion: "someVersion",
  getRemainingTimeInMillis: () => 1,
  invokedFunctionArn: "someFunctionArn",
  logGroupName: "someLogGroupName",
  logStreamName: "someLogStreamName",
  memoryLimitInMB: "1",
  succeed: () => 1,
};
