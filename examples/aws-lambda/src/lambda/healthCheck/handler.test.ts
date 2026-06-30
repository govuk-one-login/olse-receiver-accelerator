import { getParameter } from '../../../../../common/ssm/ssm'
import { getTokenFromCognito } from '../../../../../common/cognito/getTokenFromCognito'
import { createDefaultApiRequest } from '../../../../awsPayloads/defaultApiRequest'
import { mockLambdaContext } from '../../../../awsPayloads/mockLambdaContext'
import { getEnv } from '../../mock-transmitter/utils'
import { handler } from './handler'
import { type Mock } from 'vitest'

vi.mock('../../../../../common/ssm/ssm')
vi.mock('../../../../../common/cognito/getTokenFromCognito')
vi.mock('../../mock-transmitter/kmsService')
vi.mock('../../mock-transmitter/utils')

const mockGetParameter = vi.mocked(getParameter)
const mockGetEnv = vi.mocked(getEnv)
const mockGetTokenFromCognito = vi.mocked(getTokenFromCognito)

process.env['AWS_REGION'] = 'eu-west-2'

global.fetch = vi.fn()
const mockFetch = global.fetch as Mock

describe('handler', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    mockGetEnv.mockImplementation((key: string) => {
      if (key === 'AWS_STACK_NAME') return 'test-stack'
      if (key === 'MOCK_TX_SECRET_ARN') return 'mock-secret-arn'
      if (key === 'AWS_REGION') return 'eu-west-2'
      throw new Error(`Environment variable ${key} not set`)
    })

    mockGetParameter.mockResolvedValue('test-mock-verification-url')
    mockGetTokenFromCognito.mockResolvedValue('mock-token')
  })

  it('returns 200 when health check succeeds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204
    } as unknown as Response)

    const result = await handler(createDefaultApiRequest(), mockLambdaContext)

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      status: 204,
      message: 'Health check passed'
    })
  })

  it('returns 500 if health check fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400
    } as unknown as Response)

    const result = await handler(createDefaultApiRequest(), mockLambdaContext)

    expect(result.statusCode).toBe(500)
  })
})
