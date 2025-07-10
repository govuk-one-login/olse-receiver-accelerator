import { app } from './express'
import request from 'supertest'

describe('ExpressJS /v1/Events', () => {
  describe('Signal Auth handler', () => {
    // Placeholder
  })

  describe('Signal Validation handler', () => {
    // Placeholder
  })

  describe('Signal Routing handler', () => {
    it('should return 400 for invalid payload structure', async () => {
      const response = await request(app)
        .post('/v1/Events')
        .send({ some: 'payload' })
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        err: 'invalid_request',
        description: 'Invalid payload structure'
      })
    })

    it('should return 200 for account_purged event', async () => {
      const response = await request(app)
        .post('/v1/Events')
        .send({
          events: [
            { type: 'http://schemas.openid.net/secevent/risc/event/account_purged', data: {} }
          ]
        })
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Account purged.', success: true });
    })

    it('should return 200 for account_disabled event', async () => {
      const response = await request(app)
        .post('/v1/Events')
        .send({
          events: [
            { type: 'http://schemas.openid.net/secevent/risc/event/account_disabled', data: {} }
          ]
        })
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Account disabled.', success: true });
    })

    it('should return 400 for unsupported event type', async () => {
      const response = await request(app)
        .post('/v1/Events')
        .send({
          events: [
            { type: 'http://schemas.openid.net/secevent/risc/event/account_enabled', data: {} }
          ]
        })
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        err: 'invalid_request',
        description: 'Unsupported event type'
      })
    })
  })
});