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
      level: String(attributes.logLevel),
      message: String(attributes.message),
      timestamp: String(attributes.timestamp)
    }

    const logItem = new LogItem({ attributes: baseAttributes })
    logItem.addAttributes(additionalLogAttributes)

    return logItem
  }
}

function getLogLevel(): LogLevel {
  const envLevel = process.env['LOG_LEVEL']
  const validLevels: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG']

  if (validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel
  }

  return 'INFO'
}
export const logger = new Logger({
  logFormatter: new CustomLogFormatter(),
  logLevel: getLogLevel()
})
