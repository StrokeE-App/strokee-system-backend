import { Router } from "express";
import { registerParamedic, getActiveEmergencies } from "../controllers/paramedics/paramedicController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/active-emergencies", verifyTokenWithRole(["paramedic", "admin"]), getActiveEmergencies);
router.post("/register", registerParamedic);

export default router;