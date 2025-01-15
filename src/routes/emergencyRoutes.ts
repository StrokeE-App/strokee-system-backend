import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { getEmergency } from "../controllers/emergencies/emergencyController";

const router = Router()

router.get("/:emergencyId", verifyTokenWithRole(["paramedic", "admin"]), getEmergency);

export default router;
