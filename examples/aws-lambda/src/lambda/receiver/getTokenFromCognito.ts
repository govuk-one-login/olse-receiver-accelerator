import { getSecrets } from './getSecrets'

const secrets = await getSecrets()
const { userPoolClientId, userPoolClientSecret } = secrets

export const getTokenFromCognito = async () => {
  const accessTokenResponse = await fetch(
    'https://set23get.auth.eu-west-2.amazoncognito.com/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: userPoolClientId,
        client_secret: userPoolClientSecret,
        grant_type: 'client_credentials'
      })
    }
  )

  const accessTokenJsonResponse = await accessTokenResponse.json()
  // @ts-expect-error no-unknown
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const accessToken: string = accessTokenJsonResponse.access_token

  return accessToken
}
