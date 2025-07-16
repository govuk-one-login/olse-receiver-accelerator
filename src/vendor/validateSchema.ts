import Ajv, { AnySchema } from 'ajv'
import addFormats from 'ajv-formats'
import { readdir, readFile } from 'fs/promises'

const ajv = new Ajv()
addFormats(ajv)

export async function validateSignalAgainstSchemas(signalSet: unknown) {
  const absoluteSchemaPath = './examples/express-container/schemas'
  const schemaList = await readdir(absoluteSchemaPath)
  for (const schemaName of schemaList) {
    const filePath = absoluteSchemaPath + '/' + schemaName
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const schema: AnySchema = await JSON.parse(
      await readFile(filePath, { encoding: 'utf8' })
    )
    const validate = ajv.compile(schema)
    if (validate(signalSet)) {
      return { valid: true, schema: filePath }
    }
  }
  return { valid: false }
}
