// oxlint-disable no-duplicate-imports
import Ajv from "ajv";
import type { AnySchema } from "ajv";
import addFormats from "ajv-formats";
import { baseLogger as logger } from "../../../common/logging/logger";
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";

const ajv = new Ajv();
addFormats(ajv);

interface ValidResponse {
  valid: true;
  schema: string;
}
interface InvalidResponse {
  valid: false;
  message: string;
}

type Result = ValidResponse | InvalidResponse;

export async function validateSignalAgainstSchemas(signalSet: unknown): Promise<Result> {
  const absoluteSchemaPath = "./schemas";
  const schemaList = await readdir(absoluteSchemaPath);
  for (const schemaName of schemaList) {
    const filePath = `${absoluteSchemaPath}/${schemaName}`;

    const schema: AnySchema = await JSON.parse(readFileSync(filePath, { encoding: "utf8" }));
    const validate = ajv.compile(schema);
    if (validate(signalSet)) {
      return { schema: filePath, valid: true };
    } else {
      logger.info("errors when validating schema", { filePath: filePath });
    }
  }
  return { message: "unable to find matching schema", valid: false };
}
