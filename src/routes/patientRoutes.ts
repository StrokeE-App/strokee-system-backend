import { Router } from "express";
import { getAllPatients, registerPatient, creatEmergency, getPatientEmergencyContacts } from "../controllers/patients/patientController";
import { validateListofEmergencyContacts, addEmergencyContact } from "../controllers/patients/emergencyContactsController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyTokenWithRole(['admin', 'patient']), getAllPatients);
router.post("/emergency-contacts/add", verifyTokenWithRole(['admin', 'patient']), addEmergencyContact);
router.get("/emergency-contacts/:patientId", verifyTokenWithRole(['admin', 'patient']), getPatientEmergencyContacts);
router.post("/register", registerPatient);
router.post("/start-emergency", verifyTokenWithRole(['patient']), creatEmergency);
router.post("/emergency-contacts/validate", validateListofEmergencyContacts);


export default router;