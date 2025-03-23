import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addClinicController, deleteClinicController, getClinicController, getClinicsController, updateClinicController } from "../controllers/healthCenterStaff/clinicController";

const router = Router()

router.post("/register", verifyTokenWithRole(["admin"]), addClinicController);
router.get("/all", verifyTokenWithRole(["admin", "clinic"]), getClinicsController);
router.get("/:healthcenterId", verifyTokenWithRole(["admin", "clinic"]), getClinicController);
router.put("/update/:healthcenterId", verifyTokenWithRole(["admin"]), updateClinicController);
router.delete("/delete/:healthcenterId", verifyTokenWithRole(["admin"]), deleteClinicController);

export default router