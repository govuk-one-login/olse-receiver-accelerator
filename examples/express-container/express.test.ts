import { app } from './express'
import request from 'supertest'

describe('testing ExpressJS server', () => {
  it('ensure id is returned correctly', async () => {
    const response = await request(app).get('/v1/5')
    expect(response.body).toStrictEqual({ id: 5 })
  })
})
