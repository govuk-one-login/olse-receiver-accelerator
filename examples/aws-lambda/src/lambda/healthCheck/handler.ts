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
    const issuer = getEnv(ConfigurationKeys.ISSUER)
    const audience = getEnv('AUDIENCE')
    const verificationEndpointUrl = await getParameter(
      `/${stackName}/receiver-endpoint`
    )
    console.log('Verification endpoint url', verificationEndpointUrl)

    // add a pause to prevent eslint from raising issues around the lack of an await function
    await pause(10)

    const response = await sendVerificationSignalKms(
      verificationEndpointUrl,
      'health-check',
      issuer,
      audience
    )
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
      jti: `verification-request-${Date.now().toString()}`,
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
