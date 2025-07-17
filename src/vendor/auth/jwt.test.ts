import { generateJWTPayload } from '../types'
import { generateJWT } from './jwt'
import * as fs from 'fs'

jest.mock('fs')

const mockFs = fs as jest.Mocked<typeof fs>

const payload: generateJWTPayload = {
  alg: 'PS256',
  audience: 'https://audience.example.com',
  issuer: 'https://issuer.example.com',
  jti: '123456',
  payload: {},
  useExpClaim: true
}
describe('generateJWT', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should throw error when private key file cannot be read', async () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory')
    })

    await expect(generateJWT(payload)).rejects.toThrow(
      'ENOENT: no such file or directory'
    )
  })

  test('should throw error when private key file contains invalid JSON', async () => {
    mockFs.readFileSync.mockReturnValue('invalid json')

    await expect(generateJWT(payload)).rejects.toThrow()
  })

  test('should throw error when private key is invalid for signing', async () => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ invalid: 'key' }))

    await expect(generateJWT(payload)).rejects.toThrow()
  })
})
