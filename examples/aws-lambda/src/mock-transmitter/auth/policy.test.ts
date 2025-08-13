import { generatePolicy } from './policy'

describe('generatePolicy', () => {
  it('generate allow policy', () => {
    const result = generatePolicy(
      'test-principal-id-001',
      'Allow',
      'test-arn-001'
    )
    expect(result).toEqual({
      context: {},
      policyDocument: {
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: 'test-arn-001'
          }
        ],
        Version: '2012-10-17'
      },
      principalId: 'test-principal-id-001'
    })
  })

  it('generates deny policy', () => {
    const result = generatePolicy(
      'test-principal-id-001',
      'Deny',
      'test-arn-001'
    )
    expect(result).toEqual({
      context: {},
      policyDocument: {
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: 'test-arn-001'
          }
        ],
        Version: '2012-10-17'
      },
      principalId: 'test-principal-id-001'
    })
  })
})
