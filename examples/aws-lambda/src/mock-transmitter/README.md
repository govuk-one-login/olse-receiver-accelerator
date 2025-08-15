Mock SET Verification API
Serverless Lambda that authenticates using cognito, signs and sends a SET of the type 'Verification' to a receiever.

Components

- Auth: API Gateway custom authoriser
- Process: AWS Lambda to process Verification request
  - Sign: AWS KMS
  - Delivery: HTTP Post to receiver
- Keys: JWKS Endpoint exposes KMS public keys

Request flow

1. Client sends credentials to Transmitter
2. Lambda authoriser validates with cognito
3. Handler builds `Verification` SET
4. KMS signs JWT
   5 Transmitter sends SET to reciever

Endpoints

- Post/verify: processes verification request
- Get/jwks: JWKS to retrieve KMS public key for signature verification

Mock Tx Environment Variable Configuration Parameters

AWS_REGION: AWS region config for KMS and Cognito services
KMS_KEY_ID: Key id for signing Verification JWT
COGNITO_CLIENT_ID: Cognito client id for validating credentials
ISSUER: JWT iss claim identify token issuer
AUDIENCE: JWT aud claim identifiyng intended recipient
RECEIVER_ENDPOINT: HTTP endpoint where verification SETs are delivered
