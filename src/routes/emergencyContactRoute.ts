import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { getEmergencyContactUser, addNewPatientForEmergencyContact, registerEmergencyContactToStartEmergency } from "../controllers/patients/emergencyContactsController";

const router = Router()

router.get("/:userId", verifyTokenWithRole(["admin", "emergencyContact"]), getEmergencyContactUser);
router.post("/add-patient", verifyTokenWithRole(["admin", "emergencyContact"]), addNewPatientForEmergencyContact);
router.post("/register-emergency-contact-to-start-emergency", verifyTokenWithRole(["admin", "emergencyContact"]), registerEmergencyContactToStartEmergency);

export default router;
