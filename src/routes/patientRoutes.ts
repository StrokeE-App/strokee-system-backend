import { Router } from "express";
import { 
    getAllPatients, 
    registerPatient, 
    creatEmergency, 
    getPatientEmergencyContacts,
    updatePatient
 } from "../controllers/patients/patientController";
import { validateListofEmergencyContacts, addEmergencyContact, getEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from "../controllers/patients/emergencyContactsController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyTokenWithRole(['admin', 'patient']), getAllPatients);
router.get("/emergency-contacts/all/:patientId", verifyTokenWithRole(['admin', 'patient']), getPatientEmergencyContacts);
router.get("/emergency-contacts/:patientId/:contactId", verifyTokenWithRole(['admin', 'patient']), getEmergencyContact);
router.post("/emergency-contacts/add", verifyTokenWithRole(['admin', 'patient']), addEmergencyContact);
router.post("/register", registerPatient);
router.post("/start-emergency", verifyTokenWithRole(['patient']), creatEmergency);
router.post("/emergency-contacts/validate", validateListofEmergencyContacts);
router.put("/emergency-contacts/:patientId/:contactId", verifyTokenWithRole(['admin', 'patient']), updateEmergencyContact);
router.put("/update/:patientId", verifyTokenWithRole(['admin', 'patient']), updatePatient);
router.delete("/emergency-contacts/:patientId/:contactId", verifyTokenWithRole(['admin', 'patient']), deleteEmergencyContact);


export default router;