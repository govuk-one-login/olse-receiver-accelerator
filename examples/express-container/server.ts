import { app } from './express'
import { config } from './config/globalConfig'
import { ConfigurationKeys } from './config/ConfigurationKeys'
import { logger } from '../../common/logging/logger'

const port = config.getOrDefault(ConfigurationKeys.PORT, '3000')

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`)
})
