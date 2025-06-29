import { EventSubject, SsfSchema } from '@govuk-one-login/events/types/ssf';
import { LogEvents } from '@govuk-one-login/logging/log-events';
import { validateMessage } from '@govuk-one-login/ssf-validation-library/src/SSMessageValidation/validation';
import { ValidationResult } from '../../common/interfaces/ssf';
import { ErrorLog } from 'src/common/interfaces/error-log';
import { BaseEvent } from '../../common/event-types/events/base-event';

/**
 * Validates SET message against appropriate schema using events URI
 *
 * @param payload base64 encoded SET message (as a JWS)
 * @param requestId request identifier for logging (can omit if not needed in your context)
 */
export const validateSchema = async (
  payload: string,
): Promise<ValidationResult> => {
  try {
    // Split payload and decode missing section of payload to validate
    const payloadSections: string[] = payload.toString().split('.');
    const eventPayload = atob(payloadSections[1]);
    const eventMessage: SsfSchema = JSON.parse(eventPayload);

    // Validate against known message schemas
    const validationDetails = validateMessage(eventMessage);
    const schemaType = validationDetails.schemaType;

    if (!validationDetails.isValid) {
      return {
        isValid: false,
        error: {
          failureMessage: validationDetails.error?.failureMessage,
          failureReason: validationDetails.error?.failureReason,
        },
        schemaType,
      };
    }

    const eventKeys = Object.keys(eventMessage.events);
    const firstEventsKey = eventKeys[0];
    const containsAccountBlock = firstEventsKey.includes('accountBlock');
    const containsAccountConcern = firstEventsKey.includes('accountConcern');

    if (containsAccountBlock || containsAccountConcern) {
      const eventUrl = Object.keys(eventMessage.events).find((key) =>
        BaseEvent.isSubjectEvent(key)
      );
      if (eventUrl === undefined) {
        return {
          isValid: false,
          error: {
            failureMessage: 'No URI key in event',
            failureReason: 'NO_URI_KEY_IN_EVENT',
          },
        };
      }
      const eventStructure = eventMessage.events[eventUrl];
      const userSubjectPairwiseId = (eventStructure?.subject as EventSubject)
        ?.uri;
      const signalURIField = userSubjectPairwiseId?.trim();

      if (!signalURIField) {
        return {
          isValid: false,
          error: {
            failureMessage:
              'No user pairwise URI supplied in the subject block of SET',
            failureReason: 'FAILED_VALIDATION',
          },
        };
      }
    }

    return { isValid: true, error: {}, schemaType };
  } catch (error: unknown) {
    let errorLog: ErrorLog;
    if (error instanceof Error) {
      errorLog = {
        name: error.name,
        message: error.message,
        data: error,
      };
    } else {
      errorLog = {
        name: 'ERROR_PROCESSING',
        message: 'Error processing schema validation',
        data: error,
      };
    }
    return {
      isValid: false,
      error: {
        failureMessage: errorLog.message,
        failureReason: 'Unable to validate payload',
      },
    };
  }
};