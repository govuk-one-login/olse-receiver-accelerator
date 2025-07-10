export const callOAuthTokenEndpoint = async (
  clientSecret: string,
  client_id: string,
  grant_type: string,
  url: string
): Promise<unknown> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: client_id,
      client_secret: clientSecret,
      grant_type: grant_type
    })
  })

  if (response.status === 200) {
    console.log('successfully generated token')
    return await response.json()
  } else {
    const responseText = await response.text()
    console.log('Response status code from oauth token endpoint was not 200', {
      responseCode: response.status,
      responseMessage: responseText
    })
    return undefined
  }
}

const main = async () => {
  const response = await callOAuthTokenEndpoint(
    'client_secret',
    'client_id',
    'client_credentials',
    'http://localhost:3000/v1/token'
  )
  console.log(response)
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('Successfully called token endpoint')
    })
    .catch((err: unknown) => {
      console.error(err)
    })
}
