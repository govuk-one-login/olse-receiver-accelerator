import { SetPayload, SetRequest } from '../types/types'
import { handleAccountDisabled, handleAccountPurged } from './signal-handlers'
import { Response } from 'express'

describe('Signal Handlers', () => {
  const req = {} as SetRequest

  it('handleAccountPurged should return status code 200', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as Partial<Response> as Response

    const statusSpy = jest.spyOn(res, 'status').mockReturnThis()
    const jsonSpy = jest.spyOn(res, 'json').mockReturnThis()

    const signalPayload: SetPayload = { sub: 'user0' }

    handleAccountPurged(signalPayload, req, res)
    expect(statusSpy).toHaveBeenCalledWith(200)
    expect(jsonSpy).toHaveBeenCalledWith({
      success: true,
      message: 'Account purged.'
    })
  })

  it('handleAccountDisabled should return status code 200', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as Partial<Response> as Response
    const statusSpy = jest.spyOn(res, 'status').mockReturnThis()
    const jsonSpy = jest.spyOn(res, 'json').mockReturnThis()
    const signalPayload: SetPayload = { sub: 'user1' }

    handleAccountDisabled(signalPayload, req, res)

    expect(statusSpy).toHaveBeenCalledWith(200)
    expect(jsonSpy).toHaveBeenCalledWith({
      success: true,
      message: 'Account disabled.'
    })
  })
})
