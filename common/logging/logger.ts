import type {
  LogAttributes,
  LogLevel,
  UnformattedAttributes,
} from "@aws-lambda-powertools/logger/types";
import { LogFormatter, LogItem, Logger } from "@aws-lambda-powertools/logger";

class CustomLogFormatter extends LogFormatter {
  public formatAttributes(
    attributes: UnformattedAttributes,
    additionalLogAttributes: LogAttributes,
  ): LogItem {
    const baseAttributes: LogAttributes = {
      level: attributes.logLevel,
      message: attributes.message,
      ...additionalLogAttributes,
      timestamp: String(attributes.timestamp),
    };
    return new LogItem({ attributes: baseAttributes });
  }
}

class LambdaLogFormatter extends LogFormatter {
  public formatAttributes(
    attributes: UnformattedAttributes,
    additionalLogAttributes: LogAttributes,
  ): LogItem {
    const baseAttributes: LogAttributes = {
      function_arn: attributes.lambdaContext?.invokedFunctionArn,
      function_name: attributes.lambdaContext?.functionName,
      function_version: attributes.lambdaContext?.functionVersion,
      level: attributes.logLevel,
      memory_size: attributes.lambdaContext?.memoryLimitInMB,
      message: attributes.message,
      request_id: attributes.lambdaContext?.awsRequestId,
      timestamp: String(attributes.timestamp),
    };

    const logItem = new LogItem({ attributes: baseAttributes });
    logItem.addAttributes(additionalLogAttributes);

    return logItem;
  }
}

const getLogLevel = (): LogLevel => {
  const envLevel = process.env["LOG_LEVEL"];
  const validLevels: LogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

  if (validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }

  return "INFO";
};

const baseLogger = new Logger({
  logFormatter: new CustomLogFormatter(),
  logLevel: getLogLevel(),
});

const lambdaLogger = new Logger({
  logFormatter: new LambdaLogFormatter(),
  logLevel: getLogLevel(),
});

export { baseLogger, lambdaLogger };
