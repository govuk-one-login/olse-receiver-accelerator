import { signedJWTWithKMS } from '../../../../../examples/aws-lambda/src/mock-transmitter/kmsService'
import { SET } from '../../../../../examples/aws-lambda/src/mock-transmitter/mockApiTxInterfaces'
import { getTokenFromCognito } from '../../../helpers/getTokenFromCognito'
import 'dotenv/config'
describe('handler V1', () => {
  it('handler returns 200 when a valid access token is provided', async () => {
    const apiUrl = process.env['API_GATEWAY_URL'] ?? ''
    if (apiUrl === '') {
      throw new Error('API_GATEWAY_URL environment variable is not set')
    }
    const token = await getTokenFromCognito(process.env['RECEIVER_SECRET_ARN'] ?? '')

    const testSet: SET = {
      iss: 'https://gds.co.uk',
      aud: 'https://gds.co.uk',
      iat: Math.floor(Date.now() / 1000),
      sub_id: { format: 'opaque', id: 'test-sub-001' },
      jti: 'test-id-001',
      events: {
        'https://schemas.openid.net/secevent/ssf/event-type/verification': {
          state: 'test-state-001'
        }
      }
    }

    const jwt = await signedJWTWithKMS(testSet)
    console.log('Bearer ' + token)
    const response = await fetch(
      apiUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/secevent+jwt',
      },
      body: jwt
    }
    )
    expect(response.status).toStrictEqual(202)
  })
  it('handler returns 401 when no valid access token is provided', async () => {
    const apiUrl = process.env['API_GATEWAY_URL'] ?? ''
    if (apiUrl === '') {
      throw new Error('API_GATEWAY_URL environment variable is not set')
    }
    const token = await getTokenFromCognito(process.env['RECEIVER_SECRET_ARN'] ?? '')
    console.log('Bearer ' + token)
    console.log('url : ' + apiUrl)
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer thisisnot.avalid.accesstoken'
        }
      }
    )
    console.log(response)
    console.log(await response.json())
    expect(response.status).toStrictEqual(401)
  })
})
