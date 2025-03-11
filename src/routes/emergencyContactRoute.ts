import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { getEmergencyContactUser, addNewPatientForEmergencyContact } from "../controllers/patients/emergencyContactsController";

const router = Router()

router.get("/:userId", verifyTokenWithRole(["admin", "emergencyContact"]), getEmergencyContactUser);
router.post("/add-patient", verifyTokenWithRole(["admin", "emergencyContact"]), addNewPatientForEmergencyContact);

export default router;
