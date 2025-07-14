// import { app } from './express'
// import request from 'supertest'

// describe('ExpressJS /v1/Events', () => {
//   describe('Signal Auth handler', () => {
//     // Placeholder
//   })

//   describe('Signal Validation handler', () => {
//     // Placeholder
//   })

//   describe('Signal Routing handler', () => {
//     it('should return 200 for account_purged event', async () => {
//       const response = await request(app)
//         .post('/v1/Events')
//         .send({
//           iss: 'https://example.com',
//           iat: 1633072800,
//           events: {
//             'http://schemas.openid.net/secevent/risc/event/account_purged': {
//               subject: {
//                 subject_type: 'account',
//                 account: { acct: 'user@example.com' }
//               }
//             }
//           }
//         })
//         .set('Content-Type', 'application/secevent+jwt')

//       expect(response.status).toBe(202)
//       expect(response.body).toEqual({
//         message: 'Account purged.',
//         success: true
//       })
//     })

//     it('should return 200 for account_disabled event', async () => {
//       const response = await request(app)
//         .post('/v1/Events')
//         .send({
//           iss: 'https://example.com',
//           iat: 1633072800,
//           events: {
//             'http://schemas.openid.net/secevent/risc/event/account_disabled': {
//               subject: {
//                 subject_type: 'account',
//                 account: { acct: 'user@example.com' }
//               }
//             }
//           }
//         })
//         .set('Content-Type', 'application/secevent+jwt')

//       expect(response.status).toBe(202)
//       expect(response.body).toEqual({
//       })
//     })

//     it('should return 400 for unsupported event type', async () => {
//       const response = await request(app)
//         .post('/v1/Events')
//         .send({
//           iss: 'https://example.com',
//           iat: 1633072800,
//           events: {
//             'http://schemas.openid.net/secevent/risc/event/account_enabled': {
//               subject: {
//                 subject_type: 'account',
//                 account: { acct: 'user@example.com' }
//               }
//             }
//           }
//         })
//         .set('Content-Type', 'application/secevent+jwt')

//       expect(response.status).toBe(400)
//       expect(response.body).toEqual({
//         err: 'unsupported_event_type',
//         description: 'Unsupported event type'
//       })
//     })
//   })
// })
