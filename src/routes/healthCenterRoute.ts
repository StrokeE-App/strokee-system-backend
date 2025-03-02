import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addHealthCenter, getHealthCenter, deleteHealthCenter, updateHealthCenter, deliverPatient } from "../controllers/healthCenterStaff/healthCenterController";

const router = Router()

router.post("/register", addHealthCenter);
router.post("/deliver-patient", verifyTokenWithRole(["admin", "clinic"]), deliverPatient);
router.get("/:medicId", verifyTokenWithRole(["admin", "clinic"]), getHealthCenter);
router.put("/update/:medicId", verifyTokenWithRole(["admin", "clinic"]), updateHealthCenter);
router.delete("/delete/:medicId", verifyTokenWithRole(["admin", "clinic"]), deleteHealthCenter);

export default router;
