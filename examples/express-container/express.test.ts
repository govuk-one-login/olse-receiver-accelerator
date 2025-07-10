import { app } from './express'
import request from 'supertest'

describe('Express server /v1/token endpoint', () => {
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
