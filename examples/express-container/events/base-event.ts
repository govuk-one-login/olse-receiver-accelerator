import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { ErrorMessages } from '../enums/errors';
import { EventFieldNames, EventNames } from '../enums/event';
import * as setSchema from '../schemas/setschema.json';
import { EventStructure, SsfSchema } from '../events/ssf';

/**
 * The base class for shared signals/SETs.
 */
export class BaseEvent {
  private static readonly CAEP_SCHEMA_ROOT_ESCAPED =
    /https:\/\/schemas.openid.net\/secevent\/caep\/event-type\//;
  private static readonly RISC_SCHEMA_ROOT_ESCAPED =
    /https:\/\/schemas.openid.net\/secevent\/risc\/event-type\//;
  private static readonly ACTIVITY_SCHEMA_ROOT_ESCAPED =
    /https:\/\/vocab.account.gov.uk\/secevent\/v1\/activity\//;
  private static readonly NOTIFICATION_SCHEMA_ROOT_ESCAPED =
    /https:\/\/vocab.account.gov.uk\/secevent\/v1\/notification\//;
  private static readonly SUBJECT_EVENT_REGEXP = new RegExp(
    `^(${BaseEvent.CAEP_SCHEMA_ROOT_ESCAPED.source}|${BaseEvent.RISC_SCHEMA_ROOT_ESCAPED.source}` +
      `|${BaseEvent.ACTIVITY_SCHEMA_ROOT_ESCAPED.source}|${BaseEvent.NOTIFICATION_SCHEMA_ROOT_ESCAPED.source})([a-zA-Z-]+)$`
  );

  setMessage: SsfSchema; // a SET message of this event type
  subjectEventSchema: object | undefined; // the JSON schema for this event type
  eventName: EventNames; // the TxMA event name
  requiredFields: EventFieldNames[]; // the extra fields required on the SET

  constructor(
    wholeMessage: SsfSchema,
    eventName: EventNames,
    requiredFields: EventFieldNames[]
  ) {
    this.setMessage = wholeMessage;
    this.eventName = eventName;
    this.requiredFields = requiredFields;
  }

  /**
   * Checks if the given event is a subject event. A subject event is an object that contains properties
   * that identify the subject, which will be a URI when the subject is a user account. This block can also
   * contain additional information about the subject. The name of the block will be a URL that includes
   * the message type and signal type, e.g. name of the block for the CAEP credential change signal is:
   *
   * https://schemas.openid.net/secevent/caep/event-type/credential-change
   *
   * @param {string} event - The event to check.
   * @return {boolean} Returns true if the event is a subject event, otherwise false.
   */
  static isSubjectEvent(event: string): boolean {
    return this.SUBJECT_EVENT_REGEXP.test(event);
  }

  /**
   * Validate SET against SET schema and validate the subject event against
   * subject event schema.
   */
  async validateAgainstSchema(): Promise<void> {
    // validate SET
    await this.validate(setSchema, this.setMessage);

    // get the subject event
    const subjectEvent = this.getSubjectEvent();

    // validate the subject event
    await this.validate(this.subjectEventSchema ?? Object, subjectEvent);
  }

  /**
   * Retrieves the subject event of the current instance. This is the event
   * that contains the subject that the event pertains to.
   *
   * @returns {EventStructure} The message event
   * @throws {Error} Throws an error if no subject event key is found.
   */
  getSubjectEvent(): EventStructure {
    const subjectEventKey = Object.keys(this.setMessage.events).find(
      (eventKey) => BaseEvent.isSubjectEvent(eventKey)
    );
    if (subjectEventKey === undefined) {
      throw Error(ErrorMessages.NoSubjectEvent);
    }
    return this.setMessage.events[subjectEventKey];
  }

  /**
   * Validates against a given message against a given schema
   *
   * @param schema Schema to validate against
   * @param message Message to be validated
   */
  private async validate(schema: object, message: object): Promise<void> {
    const ajv = new Ajv();
    addFormats(ajv, ['date', 'uri', 'email']);

    const validate = ajv.compile(schema);
    const valid = validate(message);

    if (!valid) {
      throw new Error(JSON.stringify(validate.errors));
    }
  }
}