import { getTokenFromCognito } from '../../../helpers/getTokenFromCognito'
import 'dotenv/config'
describe('handler V1', () => {
  it('handler returns 200 when a valid access token is provided', async () => {
    const apiUrl = process.env['API_GATEWAY_URL'] ?? ''
    if (apiUrl === '') {
      throw new Error('API_GATEWAY_URL environment variable is not set')
    }
    const token = await getTokenFromCognito(process.env['SECRET_ARN'] ?? '')
    console.log('Bearer ' + token)
    const response = await fetch(
      `${apiUrl}/api/v1/Events`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        }
      }
    )
    console.log(response)
    console.log(await response.json())
    expect(response.status).toStrictEqual(200)
  })
  it('handler returns 401 when no valid access token is provided', async () => {
    const apiUrl = process.env['API_GATEWAY_URL'] ?? ''
    if (apiUrl === '') {
      throw new Error('API_GATEWAY_URL environment variable is not set')
    }
    const token = await getTokenFromCognito(process.env['SECRET_ARN'] ?? '')
    console.log('Bearer ' + token)
    const response = await fetch(
      `${apiUrl}/api/v1/Events`,
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
