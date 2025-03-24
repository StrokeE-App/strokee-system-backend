import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addHealthCenter, getHealthCenter, deleteHealthCenter, updateHealthCenter, attendedPatient, invitePatient } from "../controllers/healthCenterStaff/healthCenterController";

const router = Router()

router.post("/register", addHealthCenter);
router.post("/attended-patient", verifyTokenWithRole(["admin", "clinic"]), attendedPatient);
router.post("/invite-patient", verifyTokenWithRole(["admin", "clinic"]), invitePatient);
router.get("/:medicId", verifyTokenWithRole(["admin", "clinic"]), getHealthCenter);
router.put("/update/:medicId", verifyTokenWithRole(["admin", "clinic"]), updateHealthCenter);
router.delete("/delete/:medicId", verifyTokenWithRole(["admin", "clinic"]), deleteHealthCenter);

export default router;
