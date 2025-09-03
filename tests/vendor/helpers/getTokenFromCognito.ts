import { getSecrets } from './getSecrets'

export const getTokenFromCognito = async (secretArn: string) => {
  const secrets = await getSecrets(secretArn)
  const { userPoolClientId, userPoolClientSecret, domain } = secrets
  console.log('Domain:', domain)
  const accessTokenResponse = await fetch(
    `https://${domain}.auth.eu-west-2.amazoncognito.com/token`,
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
