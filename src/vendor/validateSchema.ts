import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readdir } from 'fs/promises'

const ajv = new Ajv()
addFormats(ajv)

export async function validateSignalAgainstSchemas(signalSet: unknown) {
  const absoluteSchemaPath = './examples/express-container/schemas'
  const schemaList = await readdir(absoluteSchemaPath)
  for (const schemaName of schemaList) {
    const filePath = '../.' + absoluteSchemaPath + '/' + schemaName
    const schema: unknown = await import(filePath)
    const validate = ajv.compile(schema)
    if (validate(signalSet)) {
      return { valid: true, schema: filePath }
    }
  }
  return { valid: false }
}
