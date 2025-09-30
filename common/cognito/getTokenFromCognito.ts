import { getSecrets } from '../../tests/vendor/helpers/getSecrets'

interface CognitoTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export const getTokenFromCognito = async (secretArn: string) => {
  const secrets = await getSecrets(secretArn)
  const { userPoolClientId, userPoolClientSecret, domain } = secrets
  try {
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

    const accessTokenJsonResponse: CognitoTokenResponse =
      (await accessTokenResponse.json()) as CognitoTokenResponse
    const accessToken: string = accessTokenJsonResponse.access_token
    return accessToken
  } catch (error) {
    console.error('Error fetching access token:', error)
    throw error
  }
}
