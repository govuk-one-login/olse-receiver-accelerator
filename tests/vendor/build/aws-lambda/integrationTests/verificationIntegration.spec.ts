import { getTokenFromCognito } from '../../../../../common/cognito/getTokenFromCognito'
import 'dotenv/config'

describe('SET Verification Event Integration Tests', () => {
    const apiUrl = process.env['VERIFICATION_ENDPOINT'] ?? ''
    const jwksUrl = process.env['JWKS_ENDPOINT'] ?? ''

    beforeAll(() => {
        if (apiUrl === '') {
            throw new Error('VERIFICATION_ENDPOINT environment variable is not set')
        }
        if (jwksUrl === '') {
            throw new Error('JWKS_ENDPOINT environment variable is not set')
        }
    })

    it('should complete full verification flow successfully', async () => {
        if (process.env['MOCK_TX_SECRET_ARN'] === undefined) {
            throw new Error('MOCK_TX_SECRET_ARN environment variable is not set')
        }
        console.log(process.env['MOCK_TX_SECRET_ARN'])
        const token = await getTokenFromCognito(process.env['MOCK_TX_SECRET_ARN'] ?? '')
        console.log('Bearer ' + token)

        const verificationPayload = {
            stream_id: 'test-stream-001',
            state: 'test-state-001'
        }

        const response = await fetch(
            `${apiUrl}/verify`,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(verificationPayload)
            }
        )

        expect(response.ok).toBe(true)
        console.log(response.status)
        expect(response.status).toBe(204)
    }, 10000)

    it('should return 401 when invalid token provided to verify endpoint', async () => {
        const verificationPayload = {
            subject: 'test-subject-001',
            verification_type: 'verification-type',
            timestamp: Date.now()
        }

        const response = await fetch(
            `${apiUrl}/verify`,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer aa.bb.cc',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(verificationPayload)
            }
        )

        console.log(response)
        expect(response.status).toBe(401)
    })

    it('should return valid jwks from public key endpoint', async () => {
        const response = await fetch(jwksUrl)
        const jwks = await response.json()
        console.log(jwks)

        expect(response.status).toBe(200)
        expect(jwks).toHaveProperty('keys')
    })
})
