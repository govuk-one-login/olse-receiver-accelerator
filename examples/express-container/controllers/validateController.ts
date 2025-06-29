import { Request, Response } from "express";
import { validateJWT } from "../services/validateJWT";
import { validateSchema } from "../services/validateSchema";

function getClientId(req: Request): string | undefined {
    const authHeader = req.headers['authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const [, payload] = token.split('.');
        if (payload) {
            try {
                const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
                return decodedPayload.client_id;
            } catch {
                return undefined;
            }
        }
    }
    return undefined;
}

export async function validateHandler(req: Request, res: Response) {
    try {
        if (req.headers['content-type'] !== 'application/secevent+jwt') {
            return res.sendStatus(415);
        }

        const body = req.body as string;
        if (!body?.trim()) {
            return res.status(400).json({ err: 'invalid_request' });
        }

        const clientID = getClientId(req);
        if (!clientID) {
            return res.status(400).json({ err: 'invalid_request', detail: 'Missing or invalid client_id' });
        }

        const jwtResult = await validateJWT(body.trim(), clientID);

        if (!jwtResult.isValid) {
            return res.status(400).json({ err: 'invalid_request', detail: jwtResult.error });
        }

        const schemaValidationResult = await validateSchema(body.trim());
        if (!schemaValidationResult.isValid) {
            return res.status(400).json({
                err: 'invalid_request',
                detail: schemaValidationResult.error?.failureMessage || 'Schema validation failed'
            });
        }

        return res.status(200).json({
            message: "Validation successful",
            payload: jwtResult.parsedSignedMessage
        });
    } catch (e) {
        return res.status(500).json({ err: 'server_error' });
    }
}