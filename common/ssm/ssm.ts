import { lambdaLogger as logger } from '../logging/logger'
import { GetParameterCommand } from '@aws-sdk/client-ssm'
import { getSSMClient } from '../../examples/aws-lambda/src/sdk/sdkClient'

export const getParameter = async (parameterName: string): Promise<string> => {
  try {
    const command = new GetParameterCommand({ Name: parameterName })
    const response = await getSSMClient().send(command)

    if (!response.Parameter?.Value) {
      throw new Error(`Parameter ${parameterName} not found or has no value`)
    }

    return response.Parameter.Value
  } catch (error) {
    logger.error(`Failed to get parameter ${parameterName}:`, { error })
    throw error
  }
}
