import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'
import { ConfigurationKeys } from '../../../../express-container/config/ConfigurationKeys'
import { getParameter } from '../../../../../common/ssm/ssm'
import { getEnv } from '../../mock-transmitter/utils'
import { signedJWTWithKMS } from '../../mock-transmitter/kmsService'
import { SET } from '../../mock-transmitter/mockApiTxInterfaces'
import { getTokenFromCognito } from '../../../../../tests/vendor/helpers/getTokenFromCognito'

const pause = (timeInMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event)
    const stackName = getEnv(ConfigurationKeys.AWS_STACK_NAME)
    const verificationEndpointUrl = await getParameter(
      `/${stackName}/mock-verification-endpoint`
    )
    console.log('Verification endpoint url', verificationEndpointUrl)

    const mockTxSecretArn = getEnv('MOCK_TX_SECRET_ARN')
    const access_token = await getTokenFromCognito(mockTxSecretArn)

    // add a pause to prevent eslint from raising issues around the lack of an await function
    await pause(10)

    const verificationRequestJWT = await createVerificationRequestJWT(
      'health-check-stream',
      'health-check-state'
    )

    const response = await fetch(verificationEndpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: verificationRequestJWT
    })
    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    }
  } catch (error) {
    // Handle any errors
    console.error('Error processing request:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error'
      })
    }
  }
}

export async function createVerificationRequestJWT(
  streamId: string,
  state: string
): Promise<string> {
  const verificationRequestSet: VerificationRequestPayload = {
    stream_id: streamId,
    state: state
  }

  return await signedJWTWithKMS(verificationRequestSet)
}

export interface VerificationRequestPayload {
  stream_id: string
  state: string
}

export async function sendVerificationSignalKms(
  relyingPartyUrl: string,
  streamId: string,
  issuer: string,
  audience: string
): Promise<boolean> {
  try {
    const verificationRequestSet: SET = {
      iss: issuer,
      aud: audience,
      iat: Math.floor(Date.now() / 1000),
      jti: `verification - request - ${Date.now().toString()} `,
      sub_id: {
        format: 'opaque',
        id: 'id'
      },
      events: {
        'https://schemas.openid.net/secevent/risc/event-type/verification': {
          state: streamId
        }
      }
    }

    const signedJWT = await signedJWTWithKMS(verificationRequestSet)

    const response = await fetch(relyingPartyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        Accept: 'application/json'
      },
      body: signedJWT
    })

    if (response.status === 202) {
      console.log('Verification request signal sent to:', { relyingPartyUrl })
      return true
    } else {
      console.error('Failed to send verification request signal')
      return false
    }
  } catch (error) {
    console.error('Error sending verification request signal:', { error })
    return false
  }
}
