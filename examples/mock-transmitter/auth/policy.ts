interface PolicyStatement {
    Effect: 'Allow' | 'Deny';
    Action: string;
    Resource: string;
}

interface AuthPolicy {
    Version: string;
    Statement: PolicyStatement[]
}

interface AuthResponse {
    principalId: string;
    policyDocument: AuthPolicy;
    context?: any;
}

export function generatePolicy(principalId: string, effect: 'Allow' | 'Deny', resource: string, context?: any): AuthResponse {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: effect,
                    Action: 'execute-api:Invoke',
                    Resource: resource
                }
            ]
        },
        context: context || {}
    }
}