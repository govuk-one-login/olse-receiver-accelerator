import express, { Request, Response } from 'express'
import { handleSignalRouting } from './signal-routing/signal-route-handler'

export const app = express()
app.use(express.json())
const v1Router = express.Router()

function signalEventHandler(req: Request, res: Response) {
  try {
    // Auth handler

    // Validation handler

    // Routing handler
    console.log('Received request:', req.body)
    handleSignalRouting(req, res)
  } catch (err) {
    console.error('Error processing request:', err)
    res.status(500).json({ error: 'Internal server error:' })
  }
}

v1Router.post('/Events', signalEventHandler)

app.use('/v1', v1Router)
