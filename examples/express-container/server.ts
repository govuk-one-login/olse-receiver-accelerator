import { app } from './express'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const port = process.env['PORT'] ?? 3000

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port.toString()}`)
})
