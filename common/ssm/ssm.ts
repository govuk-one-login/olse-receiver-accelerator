import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { getEnv } from '../../examples/aws-lambda/src/mock-transmitter/utils'
import { ConfigurationKeys } from '../config/configurationKeys'



export const getParameter = async (parameterName: string): Promise<string> => {
  try {
    const ssmClient = new SSMClient({
      region: getEnv(ConfigurationKeys.AWS_REGION)
    })
    const command = new GetParameterCommand({
      Name: parameterName
    })

    const response = await ssmClient.send(command)

    if (!response.Parameter?.Value) {
      throw new Error(`Parameter ${parameterName} not found or has no value`)
    }

    return response.Parameter.Value
  } catch (error) {
    console.error('Failed to get parameter ${parameterName}:', { error: error })
    throw error
  }
}
