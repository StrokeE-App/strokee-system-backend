import { Router } from "express";
import { registerParamedic, confirmEmergency, cancelEmergency } from "../controllers/paramedics/paramedicController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerParamedic);
router.post("/confirm-stroke", verifyTokenWithRole(["paramedic", "admin"]), confirmEmergency)
router.post("/discard-stroke", verifyTokenWithRole(["paramedic", "admin"]), cancelEmergency)

export default router;