import { Router } from "express";
import { 
    registerParamedic, 
    confirmEmergency, 
    cancelEmergency, 
    updateParamedic,
    getParamedic,
    deleteParamedic
 } from "../controllers/paramedics/paramedicController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerParamedic);
router.post("/confirm-stroke", verifyTokenWithRole(["paramedic", "admin"]), confirmEmergency)
router.post("/discard-stroke", verifyTokenWithRole(["paramedic", "admin"]), cancelEmergency)
router.get("/:paramedicId", verifyTokenWithRole(["paramedic", "admin"]), getParamedic)
router.put("/update/:paramedicId", verifyTokenWithRole(["paramedic", "admin"]), updateParamedic)
router.delete("/delete/:paramedicId", verifyTokenWithRole(["paramedic", "admin"]), deleteParamedic)

export default router;