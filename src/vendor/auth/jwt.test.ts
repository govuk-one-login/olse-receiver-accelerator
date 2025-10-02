import { config } from '../../../common/config/config'
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

  it('should throw error when private key file cannot be read', async () => {
    jest.spyOn(config, 'get').mockReturnValue('/test-path.key')
    mockFs.readFileSync.mockImplementation(() => {
      throw Object.assign(new Error('ENOENT: no such file or directory'), {
        code: 'ENOENT'
      })
    })

    await expect(generateJWT(payload)).rejects.toThrow(
      'Failed to load private key'
    )
  })

  it('should throw error when private key file contains invalid JSON', async () => {
    jest.spyOn(config, 'get').mockReturnValue('/path/to/key.json')
    mockFs.readFileSync.mockReturnValue('invalid json')

    await expect(generateJWT(payload)).rejects.toThrow()
  })

  it('should throw error when private key is invalid for signing', async () => {
    jest.spyOn(config, 'get').mockReturnValue('/path/to/key.json')
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ invalid: 'key' }))

    await expect(generateJWT(payload)).rejects.toThrow()
  })
})
