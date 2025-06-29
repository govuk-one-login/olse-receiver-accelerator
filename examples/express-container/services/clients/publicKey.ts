import { LogEvents } from '@govuk-one-login/logging/log-events';
import {
  getPublicKey,
  getPublicKeyURL,
  putPublicKey,
} from '../../db/client-table';
import {
  PublicKeyUrlNotReachable,
  PublicKeyURLMissing,
  PublicKeyWithIDNotFound,
  ClientNotConfigured,
  PublicKeyUrlNoKeyData,
} from '../../common/errors/errors';
import { JwkWithKid, PublicKeyResult } from '../../common/interfaces/ssf';
import { logger } from '../../logger';
import { ErrorLog } from '../../common/interfaces/error-log';

export async function getClientPublicKey(
  clientID: string,
  kid: string
): Promise<PublicKeyResult> {
  const existingPublicKey = await getPublicKeyFromStore(clientID, kid);
  if (existingPublicKey) {
    return { publicKey: existingPublicKey };
  }

  const clientPublicKeyURL = await getPublicKeyURLFromStore(clientID);
  if (clientPublicKeyURL === undefined) {
    logger.error(LogEvents.ErrorProcessing, {
      error: ClientNotConfigured,
    });
    return { error: ClientNotConfigured };
  }
  if (clientPublicKeyURL === '') {
    logger.error(LogEvents.ErrorProcessing, {
      error: PublicKeyURLMissing,
    });
    return { error: PublicKeyURLMissing };
  }

  let clientPublicKeys: JwkWithKid[];
  try {
    clientPublicKeys = await fetchPublicKeysFromClient(clientPublicKeyURL);
  } catch (error) {
    //Do not change its structure as there is a metric attached to it
    const errorLog: ErrorLog = {
      name: 'PUBLIC_KEY_URL_NOT_REACHABLE',
      message:
        'Token validation error owing to unresponsive Public Key endpoint.',
      data: error,
    };
    logger.error('Failed getting client public key', {
      error: errorLog,
    });
    return { error: PublicKeyUrlNotReachable };
  }
  if (!clientPublicKeys) {
    logger.error(LogEvents.ErrorProcessing, {
      error: PublicKeyUrlNoKeyData,
    });
    return { error: PublicKeyUrlNoKeyData };
  }
  const matchedPublicKey = filterPublicKeysByKid(clientPublicKeys, kid);
  if (!matchedPublicKey) {
    logger.error(LogEvents.ErrorProcessing, {
      error: PublicKeyWithIDNotFound,
    });
    return { error: PublicKeyWithIDNotFound };
  }

  await storePublicKey(clientID, kid, matchedPublicKey);

  return { publicKey: matchedPublicKey };
}

async function getPublicKeyFromStore(clientID: string, kid: string) {
  const publicKey = await getPublicKey(clientID, kid);
  logger.debug('getPublicKeyFromStore response', {
    data: { clientID, kid, publicKey },
  });
  return publicKey;
}

async function getPublicKeyURLFromStore(
  clientID: string
): Promise<string | undefined> {
  const publicKeyURL = await getPublicKeyURL(clientID);
  logger.debug('getPublicKeyURLFromStore response', {
    data: { publicKeyURL },
  });
  return publicKeyURL;
}

async function fetchPublicKeysFromClient(
  publicKeyURL: string
): Promise<JwkWithKid[]> {
  const response = await fetch(publicKeyURL, { method: 'GET' });
  const data = await response.json();
  logger.debug('fetchPublicKeysFromClient response', { data: { data } });
  return data?.jwk as JwkWithKid[];
}

function filterPublicKeysByKid(
  publicKeys: JwkWithKid[],
  kid: string
): JwkWithKid | undefined {
  const publicKey: JwkWithKid | undefined = publicKeys?.find(
    (key) => key.kid === kid
  );
  logger.debug('filterPublicKeysByKid reponse', {
    data: { publicKey, publicKeys },
  });
  return publicKey;
}

async function storePublicKey(
  clientID: string,
  kid: string,
  publicKey: JwkWithKid
) {
  const updated = await putPublicKey(clientID, kid, publicKey);
  if (!updated) {
    logger.error('Failed to update db with fetched client public key', {
      data: { clientID, kid },
    });
  }
}