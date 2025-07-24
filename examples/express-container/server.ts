import { app } from './express'
import { config } from './config/EnvironmentalVariableConfigurationProvider'
import { ConfigurationKeys } from './config/ConfigurationKeys'

const port = config.getOrDefault(ConfigurationKeys.PORT, '3000')

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
