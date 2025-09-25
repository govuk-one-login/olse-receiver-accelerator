import { app } from './express'
import { baseLogger as logger } from '../../common/logging/logger'

function main(): void {
  const port = '3000'
  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`)
  })
}

main()
