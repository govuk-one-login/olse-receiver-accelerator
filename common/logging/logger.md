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

Option 3: Per Function AWS Logging

Override log level for specific functions by setting them in template.yaml

OLSEFunction:
Type: AWS::Serverless::Function
Properties:
Environment:
Variables:
LOG_LEVEL: DEBUG
Output Format

BaseLogger output as JSON

```{
    "level": "INFO",
    "message": "Processing successful
    "timestamp": "2025-0101T00:00:00:000Z"
}
```

Lambda Logger output as JSON

```
{
    "level": "INFO",
    "message": "Processing",
    "timestamp": "2025-0101T00:00:00:000Z",
    "functionName": "OLSEFunction",
    "functionVersion": "X",
    "region": "eu-west-2",
    requestId: "some-request-id"
    "memoryLimitInMB": 128
}
```
