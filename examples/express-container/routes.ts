import { Router } from "express";
import { validateHandler } from "./controllers/validateController";
import { getIdHandler } from "./controllers/getIdController";

const router = Router();

router.post("/validate", validateHandler);
router.get("/v1/:id", getIdHandler);

export default router;