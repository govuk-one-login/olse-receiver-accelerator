import { app } from './express'
import { configReady } from '../../common/config/config'
import { baseLogger as logger } from '../../common/logging/logger'

async function main(): Promise<void> {
  await configReady()
  const port = '3000'
  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`)
  })
}

void main()
