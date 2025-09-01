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
