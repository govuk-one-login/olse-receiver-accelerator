import { Logger, LogFormatter, LogItem } from '@aws-lambda-powertools/logger'
import {
  LogAttributes,
  UnformattedAttributes
} from '@aws-lambda-powertools/logger/types'

interface format {
  level: string
  message: string
  timestamp: string
}

class CustomLogFormatter extends LogFormatter {
  public formatAttributes(
    attributes: UnformattedAttributes,
    additionalLogAttributes: LogAttributes
  ): LogItem {
    const baseAttributes: format = {
      level: String(attributes['level']),
      message: String(attributes.message),
      timestamp: String(attributes.timestamp)
    }

    const logItem = new LogItem({ attributes: baseAttributes })
    logItem.addAttributes(additionalLogAttributes)

    return logItem
  }
}

export const logger = new Logger({
  logFormatter: new CustomLogFormatter()
})
