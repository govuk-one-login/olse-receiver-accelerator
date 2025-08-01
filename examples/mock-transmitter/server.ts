import express from 'express'
import dotenv from 'dotenv'
import testRoutes from './routes/test'

import verificationRoutes from './routes/verification'

dotenv.config()

const app = express()
const PORT = 3000

app.use(express.json())
app.use('/', testRoutes)
app.use('/', verificationRoutes)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
