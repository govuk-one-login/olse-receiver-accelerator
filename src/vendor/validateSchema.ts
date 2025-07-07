import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import verificationEventSchema from '../../examples/express-container/schemas/verificationEvent.json'
import fs from 'fs'

export function listFilesInDirectory(path: string) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, content) => {
      if (err) {
        reject(err)
      }
      resolve(content)
    })
  })
}

console.log(listFilesInDirectory('./examples/express-container/schemas'))

const ajv = new Ajv()
addFormats(ajv)
const validate = ajv.compile(verificationEventSchema)

export function validateSignalAgainstSchema(signal: unknown) {
  return validate(signal)
}
