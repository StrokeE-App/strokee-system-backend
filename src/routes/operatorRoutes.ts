import { Router } from "express";
import { registerOperator } from "../controllers/operator/operatorController";

const router = Router();

router.post("/register", registerOperator);

export default router;