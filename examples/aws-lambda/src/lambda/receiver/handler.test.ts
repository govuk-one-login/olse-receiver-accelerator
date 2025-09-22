import { when } from 'jest-when'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getPublicKeyFromRemote } from '../../../../../src/vendor/getPublicKey'
import { validateJWTWithRemoteKey } from '../../../../../src/vendor/jwt/validateJWT'
import { validateSignalAgainstSchemas } from '../../../../../src/vendor/validateSchema'
import { handleSignalRouting } from '../../../../../common/signalRouting/signalRouter'
import { handler } from './handler'
import { getParameter } from '../../../../../common/ssm/ssm'
import { decodeProtectedHeader } from 'jose'

jest.mock('../../../../../src/vendor/getPublicKey')
jest.mock('../../../../../src/vendor/jwt/validateJWT')
jest.mock('../../../../../src/vendor/validateSchema')
jest.mock('../../../../../common/signalRouting/signalRouter')
jest.mock('../../../../../common/ssm/ssm')
jest.mock('jose')
jest.mock('../../../../../common/logging/logger', () => ({
    lambdaLogger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}))

global.fetch = jest.fn()

const mockEvent: APIGatewayProxyEvent = {
    body: 'mock.jwt.token',
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/receiver',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    requestContext: {} as any,
    resource: ''
}

const mockJwtPayload = {
    sub_id: { format: 'opaque', id: 'test-id' },
    events: {
        'https://schemas.openid.net/secevent/ssf/event-type/verification': {
            state: 'test-state'
        }
    }
}

const mockJwtHeader = {
    kid: 'test-kid',
    alg: 'RS256'
}

describe('receiver handler', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        jest.spyOn(console, 'error').mockImplementation()
        jest.spyOn(console, 'log').mockImplementation()

        process.env['JWKS_URL'] = 'https://example.com/jwks'
        process.env['RECEIVER_SECRET_ARN'] = 'test-arn'
        process.env['AWS_STACK_NAME'] = 'test-stack'

        when(getParameter).calledWith('/test-stack/jwks-url').mockResolvedValue('https://test.com/jwks')
        when(decodeProtectedHeader).calledWith('mock.jwt.token').mockReturnValue(mockJwtHeader)
        when(global.fetch).calledWith('https://test.com/jwks').mockResolvedValue({ json: jest.fn().mockResolvedValue({ keys: [] }) } as any)
    })

    afterEach(() => {
        delete process.env['RECEIVER_SECRET_ARN']
        delete process.env['AWS_STACK_NAME']
    })
    it('returns 400 when request body is missing', async () => {
        const eventWithoutBody = { ...mockEvent, body: null }

        const result = await handler(eventWithoutBody)

        expect(result).toEqual({
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                err: 'invalid_request',
                description: 'Request body is required'
            })
        })
    })

    it('returns 400 when JWT validation fails', async () => {
        when(getPublicKeyFromRemote).mockReturnValue(
            {} as ReturnType<typeof getPublicKeyFromRemote>
        )
        when(validateJWTWithRemoteKey).mockRejectedValue(new Error('Invalid JWT'))

        const result = await handler(mockEvent)

        expect(result).toEqual({
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                err: 'invalid_key',
                description:
                    'One or more keys used to encrypt or sign the SET is invalid or otherwise unacceptable to the SET Recipient (expired, revoked, failed certificate validation, etc.).'
            })
        })
        expect(console.error).toHaveBeenCalledWith(
            'failed to validate JWT with remote key'
        )
    })

    it('returns 400 when JWT payload is undefined', async () => {
        when(getPublicKeyFromRemote).mockReturnValue(
            {} as ReturnType<typeof getPublicKeyFromRemote>
        )
        when(validateJWTWithRemoteKey).mockResolvedValue({
            payload: undefined,
            protectedHeader: {},
            key: {}
        } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)

        const result = await handler(mockEvent)

        expect(result).toEqual({
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                err: 'invalid_request',
                description:
                    "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
            })
        })
    })

    it('returns 400 when schema validation fails', async () => {
        when(getPublicKeyFromRemote).mockReturnValue(
            {} as ReturnType<typeof getPublicKeyFromRemote>
        )
        when(validateJWTWithRemoteKey).mockResolvedValue({
            payload: mockJwtPayload,
            protectedHeader: {},
            key: {}
        } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)
        when(validateSignalAgainstSchemas).mockResolvedValue({
            valid: false,
            message: 'Invalid schema'
        })

        const result = await handler(mockEvent)

        expect(result).toEqual({
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                err: 'invalid_request',
                description:
                    "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
            })
        })
    })

    it('returns 400 when signal routing fails', async () => {
        when(getPublicKeyFromRemote).mockReturnValue(
            {} as ReturnType<typeof getPublicKeyFromRemote>
        )
        when(validateJWTWithRemoteKey).mockResolvedValue({
            payload: mockJwtPayload,
            protectedHeader: {},
            key: {}
        } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)
        when(validateSignalAgainstSchemas).mockResolvedValue({
            valid: true,
            schema: 'test-schema'
        })
        when(handleSignalRouting).mockResolvedValue({
            valid: false
        })

        const result = await handler(mockEvent)

        expect(result).toEqual({
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                err: 'invalid_request',
                description:
                    "The request body cannot be parsed as a SET, or the Event Payload within the SET does not conform to the event's definition."
            })
        })
        expect(console.error).toHaveBeenCalledWith('failed to route signal')
    })

    it('returns 202 when signal processing succeeds', async () => {
        when(getPublicKeyFromRemote).mockReturnValue(
            {} as ReturnType<typeof getPublicKeyFromRemote>
        )
        when(validateJWTWithRemoteKey).mockResolvedValue({
            payload: mockJwtPayload,
            protectedHeader: {},
            key: {}
        } as unknown as ReturnType<typeof validateJWTWithRemoteKey>)
        when(validateSignalAgainstSchemas).mockResolvedValue({
            valid: true,
            schema: 'test-schema'
        })
        when(handleSignalRouting).mockResolvedValue({
            valid: true,
            schema: 'test-schema'
        })

        const result = await handler(mockEvent)

        expect(result).toEqual({
            statusCode: 202,
            headers: { 'Content-Type': 'application/json' },
            body: ''
        })
        expect(handleSignalRouting).toHaveBeenCalledWith(
            mockJwtPayload,
            'test-schema'
        )
    })

    it('returns 500 when unexpected error occurs', async () => {
        when(getPublicKeyFromRemote).mockImplementation(() => {
            throw new Error('Unexpected error')
        })

        const result = await handler(mockEvent)

        expect(result).toEqual({
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                err: 'internal_error',
                description: 'An internal error occurred'
            })
        })
        expect(console.error).toHaveBeenCalledWith(
            'Unexpected error in receiver handler:',
            expect.any(Error)
        )
    })
})
