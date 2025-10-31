import 'dotenv/config'

describe('JWKS Endpoint Integration Tests', () => {
    const jwksUrl = process.env['JWKS_ENDPOINT'] ?? ''

    beforeAll(() => {
        if (jwksUrl === '') {
            throw new Error('JWKS_ENDPOINT environment variable is not set')
        }
    })

    it('should return valid jwks from public key endpoint', async () => {
        const response = await fetch(jwksUrl)
        const jwks = await response.json()
        console.log(jwks)

        expect(response.status).toBe(200)
        expect(jwks).toHaveProperty('keys')
    })
})
