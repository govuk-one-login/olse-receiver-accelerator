import { generateJWT, generateBasicJWT } from '../../src/auth/jwt'
import { app } from './express'
import request from 'supertest'
import { getPublicKey } from './getPublicKey'
import * as jose from 'jose'
import { readFile } from 'fs/promises'

jest.mock('./getPublicKey')

describe('Express server /v1 endpoint', () => {
  beforeAll(async () => {
    // eslint-disable-next-line
    const publicKey = await JSON.parse(
      await readFile('./keys/authPublic.key', { encoding: 'utf8' })
    )
    const mockGetPublicKey = getPublicKey as jest.Mock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockGetPublicKey.mockResolvedValue(jose.importJWK(publicKey, 'PS256'))
  })

  describe('/v1/token endpoint', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
      process.env['CLIENT_ID'] = 'test_client'
      process.env['CLIENT_SECRET'] = 'test_secret'
    })

    afterEach(() => {
      process.env = originalEnv
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

      const response = await request(app).post('/v1/token').query({
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
  })
  describe('/v1/Events endpoint', () => {
    it('should return 202 for when sent a SET with a valid JWT and payload', async () => {
      const jwt = await generateJWT()
      const payload = { jwt: jwt }
      const response = await request(app).post('/v1/Events').send(payload)
      expect(response.status).toBe(202)
      expect(response.body).toStrictEqual({
        valid: true,
        schema:
          '../../examples/express-container/schemas/verificationEvent.json'
      })
    })

    it('should return 400 and invalid signal for when sent a SET with an invalid SET payload', async () => {
      const jwt = await generateBasicJWT()
      const payload = { jwt: jwt }
      const response = await request(app).post('/v1/Events').send(payload)
      expect(response.status).toBe(400)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toStrictEqual(
        'Invalid signal, no schema matches found.'
      )
    })

    it('should return 400 and invalid jwt for when sent a jwt that cannot be validated', async () => {
      const jwt =
        'LCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSJ9.gXrPZ3yM_60dMXGE69dusbpzYASNA-XIOwsb5D5xYnSxyj6_D6OR'
      const payload = { jwt: jwt }
      const response = await request(app).post('/v1/Events').send(payload)
      console.log(response)
      expect(response.status).toBe(400)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toStrictEqual(
        'Invalid JWT, JWT could not be verified.'
      )
    })
  })
})
