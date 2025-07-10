import { SetPayload, SetRequest } from "../types/types";
import { Response } from "express";

export function handleAccountPurged(
    _setPayload: SetPayload,
    _eventData: string,
    _req: SetRequest,
    res: Response
): void {
    res.status(200).json({ success: true, message: "Account purged." });
}

export function handleAccountDisabled(
    _setPayload: SetPayload,
    _eventData: string,
    _req: SetRequest,
    res: Response
): void {
    res.status(200).json({ success: true, message: "Account disabled." });
}