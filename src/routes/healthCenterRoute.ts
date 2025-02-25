import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addHealthCenter } from "../controllers/healthCenterStaff/healthCenterController";

const router = Router()

router.post("/register", addHealthCenter);

export default router;
