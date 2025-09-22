import Ajv, { AnySchema } from 'ajv'
import addFormats from 'ajv-formats'
import { readFileSync } from 'fs'
import { readdir } from 'fs/promises'
import { baseLogger as logger } from '../../common/logging/logger'

const ajv = new Ajv()
addFormats(ajv)

interface ValidResponse {
  valid: true
  schema: string
}
interface InvalidResponse {
  valid: false
  message: string
}

type Result = ValidResponse | InvalidResponse

export async function validateSignalAgainstSchemas(
  signalSet: unknown
): Promise<Result> {
  const absoluteSchemaPath = './schemas'
  const schemaList = await readdir(absoluteSchemaPath)
  for (const schemaName of schemaList) {
    const filePath = absoluteSchemaPath + '/' + schemaName
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const schema: AnySchema = await JSON.parse(
      readFileSync(filePath, { encoding: 'utf8' })
    )
    const validate = ajv.compile(schema)
    if (validate(signalSet)) {
      return { valid: true, schema: filePath }
    } else {
      logger.info('errors when validating schema', { filePath: filePath })
    }
  }
  return { valid: false, message: 'unable to find matching schema' }
}

const embeddedSchemaPath = {
  type: 'object',
  properties: {
    jti: {
      type: 'string',
      description: 'JWT ID - A unique identifier for the JWT.'
    },
    iss: {
      type: 'string',
      format: 'uri',
      description: 'Issuer - Identifies the principal that issued the JWT.'
    },
    aud: {
      type: 'string',
      description:
        'Audience - Identifies the recipients that the JWT is intended for.'
    },
    iat: {
      type: 'integer',
      description:
        'Issued At - Time at which the JWT was issued, represented as a Unix timestamp.'
    },
    sub_id: {
      type: 'object',
      description: 'Subject Identifier - Identifies the subject of the JWT.',
      properties: {
        format: {
          type: 'string',
          description: "Format of the subject identifier (e.g., 'opaque')."
        },
        id: {
          type: 'string',
          description: 'The actual subject identifier.'
        }
      },
      required: ['format', 'id']
    },
    events: {
      type: 'object',
      description: 'Security Event Token (SET) specific events.',
      patternProperties: {
        '^https://schemas\\.openid\\.net/secevent/ssf/event-type/[a-zA-Z0-9_-]+$':
          {
            type: 'object',
            description: 'A specific security event.',
            properties: {
              state: {
                type: 'string',
                description:
                  'Event-specific data, such as a base64 encoded state value for a verification event.'
              }
            }
          }
      },
      additionalProperties: false,
      minProperties: 1
    }
  },
  required: ['jti', 'iss', 'aud', 'iat', 'sub_id', 'events'],
  additionalProperties: false
}

export async function validateSignalAgainstEmbeddedSchemas(
  signalSet: unknown
): Promise<Result> {
  const validate = ajv.compile(embeddedSchemaPath)
  if (validate(signalSet)) {
    return { valid: true, schema: 'embedded' }
  } else {
    console.log(`errors when validating embedded schema`)
  }

  await Promise.resolve()
  return { valid: false, message: 'unable to find matching schema' }
}
