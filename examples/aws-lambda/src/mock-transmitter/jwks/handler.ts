import { lambdaLogger as logger } from '../../../../../common/logging/logger'
import { APIGatewayProxyResult } from 'aws-lambda'
import { getEnv } from '../utils'
import { getKmsPublicKey } from '../kmsService'
import { JsonWebKey } from 'crypto'
import { createJwkFromRawPublicKey } from './createJwksFromRawPublicKey'

export const jwkArray: JsonWebKey[] = []

const SIGNING_KEY_ENV_VAR_NAMES = ['KMS_KEY_ID']
export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    jwkArray.length = 0
    const promiseArray = SIGNING_KEY_ENV_VAR_NAMES.map(async (envVar) => {
      const envValue = getEnv(envVar)
      const publicKeyData = await getKmsPublicKey(envValue)
      logger.info('Retrived public key from KMS', {
        keyId: publicKeyData.keyId
      })
      const jwk = createJwkFromRawPublicKey(
        publicKeyData.publicKey,
        publicKeyData.keyId
      )
      logger.info('Created JWK from public key', { jwk })
      jwkArray.push(jwk)
    })

    const res = await Promise.allSettled(promiseArray)

    let failedCount = 0
    res.forEach((promise) => {
      if (promise.status === 'rejected') {
        logger.error('Failed to create a JWK', {
          reason: String(promise.reason)
        })
        failedCount += 1
      }
    })

    if (failedCount === 0) {
      logger.info('Returning jwks', { keys: jwkArray })
      return {
        statusCode: 200,
        body: JSON.stringify({ keys: jwkArray })
      }
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' })
      }
    }
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'INTERNAL_SERVER_ERROR',
        error_description: 'unexpected error occured'
      })
    }
  }
}
