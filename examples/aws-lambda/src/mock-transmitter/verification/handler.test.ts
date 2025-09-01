// import { APIGatewayProxyEvent } from 'aws-lambda'
// import { handler } from './handler'
// import { getVerificationRequest } from './requestParser'
// import { constructVerificationFullSecurityEvent } from './constructVerificationSecurityEvent'
// import { signedJWTWithKMS } from '../kmsService'
// import { isValidationError } from './validation'
// import { SET } from '../mockApiTxInterfaces'

// jest.mock('./requestParser')
// jest.mock('./constructVerificationSecurityEvent')
// jest.mock('../kmsService')
// jest.mock('./validation')

// const mockGetVerificationRequest = jest.mocked(getVerificationRequest)
// const mockConstructVerificationFullSecurityEvent = jest.mocked(
//   constructVerificationFullSecurityEvent
// )
// const mockSignedJWTwithKms = jest.mocked(signedJWTWithKMS)
// const mockIsValidationError = jest.mocked(isValidationError)

// global.fetch = jest.fn()
// const mockFetch = jest.mocked(fetch)

// const mockEvent: Partial<APIGatewayProxyEvent> = {
//   requestContext: { requestId: 'test-request-id-001' }
// } as unknown as APIGatewayProxyEvent
// const mockResponse: Partial<Response> = {}

// describe('handler', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//     process.env['RECEIVER_ENDPOINT'] = 'https://rp.co.uk/events'
//   })

//   // it('processes verification request successfully', async () => {
//   //   const mockRequest = { stream_id: 'test-user-id-001', state: undefined }
//   //   const mockSET: Partial<SET> = { iss: 'test-iss-001', aud: 'test-aud-001' }
//   //   const mockJwt = 'header.payload.sig'

//   //   mockGetVerificationRequest.mockReturnValue(mockRequest)
//   //   mockConstructVerificationFullSecurityEvent.mockReturnValue(mockSET as SET)
//   //   mockSignedJWTwithKms.mockResolvedValue(mockJwt)
//   //   mockFetch.mockResolvedValue(mockResponse as Response)

//   //   const result = await handler(mockEvent as APIGatewayProxyEvent)

//   //   expect(result.statusCode).toBe(204)
//   // })

//   it('returns 400 for validation errors', async () => {
//     const validationError = new Error('Invalid request')
//     mockGetVerificationRequest.mockImplementation(() => {
//       throw validationError
//     })
//     mockIsValidationError.mockReturnValue(true)

//     const result = await handler(mockEvent as APIGatewayProxyEvent)

//     expect(result.statusCode).toBe(400)
//   })

//   it('returns 500 for internal errors', async () => {
//     const internalError = new Error('Error')
//     mockGetVerificationRequest.mockImplementation(() => {
//       throw internalError
//     })
//     mockIsValidationError.mockReturnValue(false)

//     const result = await handler(mockEvent as APIGatewayProxyEvent)

//     expect(result.statusCode).toBe(500)
//   })
// })
