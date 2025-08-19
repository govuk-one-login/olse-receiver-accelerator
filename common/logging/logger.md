The four basic logging levels are available

- info: Gerenal info (default)
- warn: Warnings and errors
- error: Only errors
- debug: Detailed debugging

Set the log level using environment variables:

Option 1: Locally

    `LOG_LEVEL=INFO`

Option 2: AWS Logging

Set the parameter value in template.yaml within the Globals section

```
Globals:
    Function:
        Environment:
            Variables:
                LOG_LEVEL: !Ref LogLevel
```

Output Format

All logs output as JSON with only essential fields

```{
    "level": "INFO",
    "message": "Processing successful
    "timestamp": "2025-0101T00:00:00:000Z"
}
```
