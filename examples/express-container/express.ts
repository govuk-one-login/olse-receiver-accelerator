import express, { Request, Response } from 'express'
import { handleSignalRouting } from './signal-routing/signal-route-handler'
import { sendSignalResponse } from './utils/response-helper'
import { CustomSetErrorCode } from './enums/enums'
import { SetPayload } from './interfaces/interfaces'

export const app = express()
app.use(express.json())
const v1Router = express.Router()

function signalEventHandler(req: Request, res: Response): void {
  try {
    // Auth handler

    // Validation handler

    // Routing handler
    const signalPayload: SetPayload = req.body as SetPayload
    const result = handleSignalRouting(signalPayload)

    if (result.success) {
      sendSignalResponse(res, true)
    } else {
      sendSignalResponse(res, false, result.errorCode, result.message, result.statusCode)
    }
  } catch (err) {
    console.error('Error processing request:', err)
    sendSignalResponse(
      res,
      false,
      CustomSetErrorCode.FAILED_TO_PROCESS,
      'Failed to process the request',
      500
    )
  }
}

v1Router.post('/Events', signalEventHandler)

app.use('/v1', v1Router)
