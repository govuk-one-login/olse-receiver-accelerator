import { Logger, LogFormatter, LogItem } from '@aws-lambda-powertools/logger'
import {
  LogAttributes,
  LogLevel,
  UnformattedAttributes
} from '@aws-lambda-powertools/logger/types'

class CustomLogFormatter extends LogFormatter {
  public formatAttributes(
    attributes: UnformattedAttributes,
    additionalLogAttributes: LogAttributes
  ): LogItem {
    const baseAttributes: LogAttributes = {
      level: attributes.logLevel,
      message: attributes.message,
      ...additionalLogAttributes,
      timestamp: String(attributes.timestamp)
    }
    return new LogItem({ attributes: baseAttributes })
  }
}

class LambdaLogFormatter extends LogFormatter {
  public formatAttributes(
    attributes: UnformattedAttributes,
    additionalLogAttributes: LogAttributes
  ): LogItem {
    const baseAttributes: LogAttributes = {
      level: attributes.logLevel,
      message: attributes.message,
      timestamp: String(attributes.timestamp),
      function_name: attributes.lambdaContext?.functionName,
      function_version: attributes.lambdaContext?.functionVersion,
      function_arn: attributes.lambdaContext?.invokedFunctionArn,
      request_id: attributes.lambdaContext?.awsRequestId,
      memory_size: attributes.lambdaContext?.memoryLimitInMB
    }

    const logItem = new LogItem({ attributes: baseAttributes })
    logItem.addAttributes(additionalLogAttributes)

    return logItem
  }
}

const getLogLevel = (): LogLevel => {
  const envLevel = process.env['LOG_LEVEL']
  const validLevels: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG']

  if (validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel
  }

  return 'INFO'
}

export const baseLogger = new Logger({
  logLevel: getLogLevel(),
  logFormatter: new CustomLogFormatter()
})

export const lambdaLogger = new Logger({
  logLevel: getLogLevel(),
  logFormatter: new LambdaLogFormatter()
})
