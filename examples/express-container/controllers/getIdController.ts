import { Request, Response } from "express";
export function getIdHandler(req: Request, res: Response) {
  res.json({ id: req.params.id });
}