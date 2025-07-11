import { callOAuthTokenEndpoint } from './callTokenEndpoint'

global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('callOAuthTokenEndpoint', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    mockFetch.mockClear()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should return parsed JSON on 200 response', async () => {
    const mockResponse = { access_token: 'token123', token_type: 'Bearer' }
    mockFetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse)
    } as unknown as Response)

    const result = await callOAuthTokenEndpoint(
      'secret',
      'client',
      'client_credentials',
      'http://test.com'
    )

    expect(result).toEqual(mockResponse)
    expect(consoleSpy).toHaveBeenCalledWith('successfully generated token')
  })

  it('should return undefined on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      status: 401,
      text: jest.fn().mockResolvedValue('Unauthorised')
    } as unknown as Response)

    const result = await callOAuthTokenEndpoint(
      'secret',
      'client',
      'client_credentials',
      'http://test.com'
    )

    expect(result).toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Response status code from oauth token endpoint was not 200',
      {
        responseCode: 401,
        responseMessage: 'Unauthorised'
      }
    )
  })

  it('should make POST request with correct headers and body', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({})
    } as unknown as Response)

    await callOAuthTokenEndpoint(
      'test_secret',
      'test_client',
      'client_credentials',
      'http://example.com/token'
    )

    expect(mockFetch).toHaveBeenCalledWith('http://example.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: 'test_client',
        client_secret: 'test_secret',
        grant_type: 'client_credentials'
      })
    })
  })

  it('should handle fetch rejection', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(
      callOAuthTokenEndpoint(
        'secret',
        'client',
        'client_credentials',
        'http://test.com'
      )
    ).rejects.toThrow('Network error')
  })

  it('should handle JSON parsing error', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as Response)

    await expect(
      callOAuthTokenEndpoint(
        'secret',
        'client',
        'client_credentials',
        'http://test.com'
      )
    ).rejects.toThrow('Invalid JSON')
  })
})
