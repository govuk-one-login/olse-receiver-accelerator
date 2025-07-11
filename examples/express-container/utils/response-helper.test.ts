import { SetErrorCode } from '../types/types'
import { sendSignalResponse } from './response-helper'
import { Response } from 'express'

describe('sendSignalResponse', () => {
  it('should send a 200 response for successful requests', () => {
    // const res = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn().mockReturnThis(),
    // } as Partial<Response> as Response;
    const res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as Partial<Response> as Response

    const statusSpy = jest.spyOn(res, 'status').mockReturnThis()
    const jsonSpy = jest.spyOn(res, 'json').mockReturnThis()
    sendSignalResponse(res, true)

    // expect(res.status).toHaveBeenCalledWith(200);
    // expect(res.json).toHaveBeenCalledWith({ success: true });

    expect(statusSpy).toHaveBeenCalledWith(200)
    expect(jsonSpy).toHaveBeenCalledWith({ success: true })
  })

  it('should send a 400 response for failed requests', () => {
    // const res = {
    //     status: jest.fn().mockReturnThis(),
    //     set: jest.fn().mockReturnThis(),
    //     json: jest.fn().mockReturnThis(),
    // } as Partial<Response> as Response;
    const res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as Partial<Response> as Response
    const statusSpy = jest.spyOn(res, 'status').mockReturnThis()
    const jsonSpy = jest.spyOn(res, 'json').mockReturnThis()
    const setSpy = jest.spyOn(res, 'set').mockReturnThis()

    sendSignalResponse(
      res,
      false,
      SetErrorCode.INVALID_REQUEST,
      'An error occurred while processing the request.'
    )

    // expect(res.status).toHaveBeenCalledWith(400);
    // expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/json');
    // expect(res.json).toHaveBeenCalledWith({
    //     err: "invalid_request",
    //     description: "An error occurred while processing the request."
    // });
    expect(statusSpy).toHaveBeenCalledWith(400)
    expect(setSpy).toHaveBeenCalledWith('Content-Type', 'application/json')
    expect(jsonSpy).toHaveBeenCalledWith({
      err: 'invalid_request',
      description: 'An error occurred while processing the request.'
    })
  })
})
