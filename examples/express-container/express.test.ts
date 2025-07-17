import { webcrypto } from 'crypto'
import { readFileSync } from 'fs'
import { when } from 'jest-when'
import * as jose from 'jose'
import request from 'supertest'
import { generateJWT } from '../../src/vendor/auth/jwt'
import { getPublicKeyFromRemote } from '../../src/vendor/getPublicKey'
import { app } from './express'

jest.mock('../../src/vendor/getPublicKey', () => ({
  getPublicKeyFromRemote: jest.fn()
}))

const sampleVerificationEvent = {
  alg: 'PS256',
  audience: 'https://aud.example.com',
  issuer: 'https://issuer.example.com',
  jti: '123456',
  useExpClaim: false,
  payload: {
    sub_id: {
      format: 'opaque',
      id: 'f67e39a0a4d34d56b3aa1bc4cff0069f'
    },
    events: {
      'https://schemas.openid.net/secevent/ssf/event-type/verification': {
        state: 'VGhpcyBpcyBhbiBleGFtcGxlIHN0YXRlIHZhbHVlLgo='
      }
    }
  }
}

let publicKeyString
let publicKeyJson
let key: webcrypto.CryptoKey | Uint8Array

describe('Express server /v1 endpoint', () => {
  const originalEnv = process.env

  beforeEach(async () => {
    jest.resetAllMocks()
    jest.clearAllMocks()
    jest.useFakeTimers()
    process.env = { ...originalEnv }
    process.env['CLIENT_ID'] = 'test_client'
    process.env['CLIENT_SECRET'] = 'test_secret'

    publicKeyString = readFileSync('./keys/authPublic.key', {
      encoding: 'utf8'
    })
    // eslint-disable-next-line
    publicKeyJson = JSON.parse(publicKeyString as any)
    key = await jose.importJWK(publicKeyJson as jose.JWK, 'PS256')
  })

  afterEach(() => {
    process.env = originalEnv
    jest.useRealTimers()
  })

  it('should return 400 for invalid grant type', async () => {
    const response = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'test_secret',
      grant_type: 'invalid_grant'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'invalid_grant' })
  })

  it('should return 401 for incorrect client_id', async () => {
    const response = await request(app).post('/v1/token').query({
      client_id: 'wrong_client',
      client_secret: 'test_secret',
      grant_type: 'client_credentials'
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'invalid_client' })
  })

  it('should return 401 for incorrect client_secret', async () => {
    const response = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'wrong_secret',
      grant_type: 'client_credentials'
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'invalid_client' })
  })

  it('should return 401 when CLIENT_ID env var is missing', async () => {
    delete process.env['CLIENT_ID']

    const response = await request(app)
      .post('/v1/token')
      .set('content-type', 'application/secevent+jwt')
      .query({
        client_id: 'test_client',
        client_secret: 'test_secret',
        grant_type: 'client_credentials'
      })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'invalid_client' })
  })

  it('should return 401 when CLIENT_SECRET env var is missing', async () => {
    delete process.env['CLIENT_SECRET']

    const response = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'test_secret',
      grant_type: 'client_credentials'
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'invalid_client' })
  })

  it('should return 200 with valid credentials', async () => {
    const response = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'test_secret',
      grant_type: 'client_credentials'
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('access_token')
    expect(response.body).toHaveProperty('token_type', 'Bearer')
    expect(response.body).toHaveProperty('expires_in', 3600)
  })

  it('should return 202 for when sent a SET with a valid JWT and payload', async () => {
    // @ts-expect-error ignore type errors
    when(getPublicKeyFromRemote).mockReturnValue(key)
    const jwt = await generateJWT(sampleVerificationEvent)

    const tokenResponse = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'test_secret',
      grant_type: 'client_credentials'
    })

    expect(tokenResponse.status).toBe(200)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accessToken = tokenResponse.body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = accessToken.access_token as string

    const response = await request(app)
      .post('/v1/Events')
      .set('content-type', 'application/secevent+jwt')
      .set('Authorization', `Bearer ${token}`)
      .send(jwt)

    expect(response.status).toBe(202)
  })

  it('should return 400 and invalid signal for when sent a SET with an invalid SET payload', async () => {
    // @ts-expect-error ignore type errors
    when(getPublicKeyFromRemote).mockReturnValue(key)
    const jwt = await generateJWT({
      alg: 'PS256',
      audience: 'https://aud.example.com',
      issuer: 'https://issuer.example.com',
      jti: '123456',
      useExpClaim: false,
      payload: {
        foo: {
          format: 'opaque',
          id: 'f67e39a0a4d34d56b3aa1bc4cff0069f'
        },
        events: {
          'https://schemas.openid.net/secevent/ssf/event-type/verification': {
            state: 'VGhpcyBpcyBhbiBleGFtcGxlIHN0YXRlIHZhbHVlLgo='
          }
        }
      }
    })

    const tokenResponse = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'test_secret',
      grant_type: 'client_credentials'
    })

    expect(tokenResponse.status).toBe(200)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accessToken = tokenResponse.body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = accessToken.access_token as string

    const response = await request(app)
      .post('/v1/Events')
      .set('content-type', 'application/secevent+jwt')
      .set('Authorization', `Bearer ${token}`)
      .send(jwt)

    expect(response.status).toBe(400)
    expect(response.body).toStrictEqual({
      err: 'invalid_request',
      description:
        "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
    })
  })

  it('should return 400 and invalid jwt for when sent a jwt that cannot be validated', async () => {
    const jwt =
      'LCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSJ9.gXrPZ3yM_60dMXGE69dusbpzYASNA-XIOwsb5D5xYnSxyj6_D6OR'

    const tokenResponse = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'test_secret',
      grant_type: 'client_credentials'
    })

    expect(tokenResponse.status).toBe(200)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accessToken = tokenResponse.body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = accessToken.access_token as string

    const response = await request(app)
      .post('/v1/Events')
      .set('content-type', 'application/secevent+jwt')
      .set('Authorization', `Bearer ${token}`)
      .send(jwt)

    expect(response.status).toBe(400)

    expect(response.body).toStrictEqual({
      err: 'invalid_key',
      description:
        'One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.).'
    })
  })

  it('should return 401 for expired auth token', async () => {
    // @ts-expect-error ignore type errors
    when(getPublicKeyFromRemote).mockReturnValue(key)
    const jwt = await generateJWT(sampleVerificationEvent)

    const tokenResponse = await request(app).post('/v1/token').query({
      client_id: 'test_client',
      client_secret: 'test_secret',
      grant_type: 'client_credentials'
    })

    expect(tokenResponse.status).toBe(200)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = tokenResponse.body.access_token as string

    jest.advanceTimersByTime(3600000 + 1)

    const response = await request(app)
      .post('/v1/Events')
      .set('content-type', 'application/secevent+jwt')
      .set('Authorization', `Bearer ${token}`)
      .send(jwt)

    expect(response.status).toBe(401)
  })
})
