import { isValidationError, validateBody } from './validation'

describe('isValidationError', () => {
  it('returns true for validation errors', () => {
    expect(isValidationError('MISSING_BODY')).toBe(true)
    expect(isValidationError('INVALID_JSON')).toBe(true)
    expect(isValidationError('MISSING_STREAM_ID')).toBe(true)
    expect(isValidationError('INVALID_STATE')).toBe(true)
  })

  it('returns false for non validation error', () => {
    expect(isValidationError('not an error')).toBe(false)
  })
})

describe('validateBody', () => {
  it('validates correct body', () => {
    const body = JSON.stringify({
      stream_id: 'test-stream-id-001',
      state: 'test-state-001'
    })
    const result = validateBody(body)

    expect(result).toEqual({
      stream_id: 'test-stream-id-001',
      state: 'test-state-001'
    })
  })

  it('throws error when body is null', () => {
    expect(() => validateBody(null)).toThrow('MISSING_BODY')
  })

  it('throws error when body is invalid json', () => {
    expect(() => validateBody('invalid-json')).toThrow('INVALID_JSON')
  })

  it('throws error when missing stream id', () => {
    const body = JSON.stringify({ state: 'test-state-001' })
    expect(() => validateBody(body)).toThrow('MISSING_STREAM_ID')
  })

  it('throws error when invalid stream id', () => {
    const body = JSON.stringify({ stream_id: 'test-state-001@' })
    expect(() => validateBody(body)).toThrow('INVALID_STREAM_ID')
  })

  it('throws error when invalid state', () => {
    const body = JSON.stringify({ stream_id: 'test-stream-id-001', state: 123 })
    expect(() => validateBody(body)).toThrow('INVALID_STATE')
  })
})
