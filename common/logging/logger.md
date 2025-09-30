# Logging Usage and Configuration

This project uses two custom loggers based on AWS Lambda Powertools:

- `baseLogger`: For general application logging (uses `CustomLogFormatter`)
- `lambdaLogger`: For Lambda-specific logging (uses `LambdaLogFormatter`)

## Log Levels

The following log levels are available:

- `INFO`: General info (default)
- `WARN`: Warnings and errors
- `ERROR`: Only errors
- `DEBUG`: Detailed debugging

Set the log level using the `LOG_LEVEL` environment variable. Example:

```sh
LOG_LEVEL=DEBUG npm start
```

Or in AWS SAM/CloudFormation:

```yaml
Globals:
  Function:
    Environment:
      Variables:
        LOG_LEVEL: !Ref LogLevel
```

Override per function:

```yaml
OLSEFunction:
  Type: AWS::Serverless::Function
  Properties:
    Environment:
      Variables:
        LOG_LEVEL: DEBUG
```

## Usage

Import the logger you need:

```typescript
import { baseLogger } from '../logging/logger'
import { lambdaLogger } from '../logging/logger'

baseLogger.info('Message', { context })
lambdaLogger.error('Error occurred', { error })
```

## Output Format

### baseLogger output (JSON)

```
{
    "level": "INFO",
    "message": "Processing successful",
    "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### lambdaLogger output (JSON)

```
{
    "level": "INFO",
    "message": "Processing",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "function_name": "OLSEFunction",
    "function_version": "X",
    "function_arn": "arn:aws:lambda:...",
    "request_id": "some-request-id",
    "memory_size": 128
}
```

## Customization

- The log formatters (`CustomLogFormatter`, `LambdaLogFormatter`) control the output structure.
- The log level is determined at runtime by the `getLogLevel` function, which checks the `LOG_LEVEL` environment variable.
