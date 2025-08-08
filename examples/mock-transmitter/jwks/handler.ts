import { APIGatewayProxyResult } from "aws-lambda";
import { getEnv } from "../utils";
import { getKmsPublicKey } from "../kmsService";
import { JsonWebKey } from "crypto";


export const jwkArray: JsonWebKey[] = []


const SIGNING_KEY_ENV_VAR_NAMES = ['KMS_KEY_ID']
export async function handler(): Promise<APIGatewayProxyResult> {
    try {

        const promiseArray = SIGNING_KEY_ENV_VAR_NAMES.map(async (envVar) => {
            const publicKeyData = await getKmsPublicKey(getEnv(envVar));


            return { envVar, publicKeyData }
        })

        const res = await Promise.allSettled(promiseArray)

        let failedCount = 0
        res.forEach((promise) => {
            if (promise.status === 'rejected') {
                console.error('failed to create a JWK', { reason: promise.reason })
                failedCount += 1
            }
        })

        if (failedCount === 0) {
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
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'INTERNAL_SERVER_ERROR',
                error_description: 'unexpected error occured'
            })
        }
    }
}