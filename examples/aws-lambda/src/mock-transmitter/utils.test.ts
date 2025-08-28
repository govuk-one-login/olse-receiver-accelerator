import { getEnv } from './utils'

describe('getEnv', () => {
  beforeEach(() => {
    delete process.env['VAR']
  })

  it('returns environment variable', () => {
    process.env['VAR'] = 'test-var-001'

    const result = getEnv('VAR')

    expect(result).toBe('test-var-001')
  })

  it('throws error when env var is missing', () => {
    expect(() => getEnv('undefined var')).toThrow(
      'Missing environment variable: undefined var'
    )
  })
})
