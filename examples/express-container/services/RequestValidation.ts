import { BadRequestError } from "../errors/BadRequestError";
import { ErrorMessages } from "../errors/ErrorMessages";

export class RequestValidation {
  static readonly jwsSectionCount: number = 3;
  static readonly base64regex =
    /^([0-9a-zA-Z+_\-\/]{4})*(([0-9a-zA-Z+_\-\/]{2}==)|([0-9a-zA-Z+_\-\/]{3}=))?$/;

  /**
   * Validate Inbound API request body for correct structure
   * @param requestBody
   */
  static validateInboundEvent(requestBody: unknown) {
    if (typeof requestBody !== 'string')
      throw new BadRequestError(ErrorMessages.NotString);

    const payloadSections: string[] = requestBody.split('.');
    if (
      payloadSections.length !== RequestValidation.jwsSectionCount ||
      !payloadSections.every((section) => !!section)
    )
      throw new BadRequestError(ErrorMessages.NotValidJWSStructure);

    if (
      !payloadSections.every((section) =>
        RequestValidation.checkValidBase64(section)
      )
    )
      throw new BadRequestError(ErrorMessages.NotValidBase64);
  }
    /**
   * Check Base64 string is valid using Regex pattern
   * @param inputString
   * @returns true if `inputString` is valid base 64
   */
  static checkValidBase64(inputString: string): boolean {
    const adjString: string =
      (inputString.length & 3) == 0
        ? inputString
        : inputString.padEnd(((inputString.length >> 2) + 1) << 2, '=');
    return this.base64regex.test(adjString);
  }
}