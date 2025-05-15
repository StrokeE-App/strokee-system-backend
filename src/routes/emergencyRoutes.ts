import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { getEmergency, getAllEmergency } from "../controllers/emergencies/emergencyController";

const router = Router()

router.get("/all", verifyTokenWithRole(["paramedic", "admin"]), getAllEmergency);
router.get("/:emergencyId", verifyTokenWithRole(["paramedic", "admin"]), getEmergency);


export default router;
