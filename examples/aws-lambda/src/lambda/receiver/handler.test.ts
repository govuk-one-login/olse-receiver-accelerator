// import { getTokenFromCognito } from './getTokenFromCognito'

describe('handler V1', () => {
  // it('handler returns 200 when a valid access token is provided', async () => {
  //   const token = await getTokenFromCognito()
  //   console.log('Bearer ' + token)
  //   const response = await fetch(
  //     'https://ck4o4vjwgb.execute-api.eu-west-2.amazonaws.com/dev/api/v1/Events',
  //     {
  //       method: 'POST',
  //       headers: {
  //         Authorization: 'Bearer ' + token
  //       }
  //     }
  //   )
  //   console.log(response)
  //   console.log(await response.json())
  //   expect(response.status).toStrictEqual(200)
  // })
  // it('handler returns 401 when no valid access token is provided', async () => {
  //   const token = await getTokenFromCognito()
  //   console.log('Bearer ' + token)
  //   const response = await fetch(
  //     'https://ck4o4vjwgb.execute-api.eu-west-2.amazonaws.com/dev/api/v1/Events',
  //     {
  //       method: 'POST',
  //       headers: {
  //         Authorization: 'Bearer thisisnot.avalid.accesstoken'
  //       }
  //     }
  //   )
  //   console.log(response)
  //   console.log(await response.json())
  //   expect(response.status).toStrictEqual(401)
  // })
  it('should be true', () => {
    expect(true).toBeTruthy()
  })
})
