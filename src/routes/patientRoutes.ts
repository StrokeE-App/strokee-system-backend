import { Router } from "express";
import { getAllPatients, registerPatient, creatEmergency } from "../controllers/patients/patientController";
import { registerEmergencyContacts, validateListofEmergencyContacts } from "../controllers/patients/emergencyContactsController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyTokenWithRole(['admin', 'patient']), getAllPatients);
router.post("/register", registerPatient);
router.post("/start-emergency", verifyTokenWithRole(['patient']), creatEmergency);
router.post("/emergency-contacts/register", verifyTokenWithRole(['admin', 'patient']), registerEmergencyContacts);
router.post("/emergency-contacts/validate", validateListofEmergencyContacts);


export default router;