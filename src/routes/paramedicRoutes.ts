import { Router } from "express";
import { registerParamedic, getActiveEmergencies, confirmEmergency, cancelEmergency } from "../controllers/paramedics/paramedicController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/active-emergencies", verifyTokenWithRole(["paramedic", "admin"]), getActiveEmergencies);
router.post("/register", registerParamedic);
router.post("/confirm-stroke", verifyTokenWithRole(["paramedic", "admin"]), confirmEmergency)
router.post("/discard-stroke", verifyTokenWithRole(["paramedic", "admin"]), cancelEmergency)

export default router;