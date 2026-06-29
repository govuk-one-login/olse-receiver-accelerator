import { config } from '../../../common/config/config'
import { generateJWTPayload } from '../types'
import { generateJWT } from './jwt'
import * as fs from 'fs'

vi.mock('fs')

const mockFs = vi.spyOn(fs, 'readFileSync')

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
    vi.clearAllMocks()
  })

  it('should throw error when private key file cannot be read', async () => {
    vi.spyOn(config, 'get').mockReturnValue('/test-path.key')
    mockFs.mockImplementation(() => {
      throw Object.assign(new Error('ENOENT: no such file or directory'), {
        code: 'ENOENT'
      })
    })

    await expect(generateJWT(payload)).rejects.toThrow(
      'Failed to load private key'
    )
  })

  it('should throw error when private key file contains invalid JSON', async () => {
    vi.spyOn(config, 'get').mockReturnValue('/path/to/key.json')
    mockFs.mockReturnValue('invalid json')

    await expect(generateJWT(payload)).rejects.toThrow()
  })

  it('should throw error when private key is invalid for signing', async () => {
    vi.spyOn(config, 'get').mockReturnValue('/path/to/key.json')
    mockFs.mockReturnValue(JSON.stringify({ invalid: 'key' }))

    await expect(generateJWT(payload)).rejects.toThrow()
  })
})
