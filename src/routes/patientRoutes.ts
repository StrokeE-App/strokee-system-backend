import { Router } from "express";
import { 
    getAllPatients, 
    registerPatient, 
    creatEmergency, 
    getPatientEmergencyContacts,
    updatePatient,
    getPatient,
    deletePatient,
    registerEmergencyContact
 } from "../controllers/patients/patientController";
import { 
    validateListofEmergencyContacts, 
    addEmergencyContact, 
    getEmergencyContact, 
    updateEmergencyContact, 
    deleteEmergencyContact,
    sendActivationEmail,
    registerEmergencyContactToStartEmergency
} from "../controllers/patients/emergencyContactsController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyTokenWithRole(['admin', 'patient']), getAllPatients);
router.get("/register-emergency-contact", registerEmergencyContact);
router.post("/register-emergency-contact-to-start-emergency", registerEmergencyContactToStartEmergency);
router.post("/send-activation-email", sendActivationEmail);
router.get("/:patientId", verifyTokenWithRole(['admin', 'patient']), getPatient);
router.get("/emergency-contacts/all/:patientId", verifyTokenWithRole(['admin', 'patient']), getPatientEmergencyContacts);
router.get("/emergency-contacts/:patientId/:contactId", verifyTokenWithRole(['admin', 'patient']), getEmergencyContact);
router.post("/emergency-contacts/add", verifyTokenWithRole(['admin', 'patient']), addEmergencyContact);
router.post("/register", registerPatient);
router.post("/start-emergency", verifyTokenWithRole(['patient', 'emergencyContact']), creatEmergency);
router.post("/emergency-contacts/validate", validateListofEmergencyContacts);
router.put("/emergency-contacts/:patientId/:contactId", verifyTokenWithRole(['admin', 'patient']), updateEmergencyContact);
router.put("/update/:patientId", verifyTokenWithRole(['admin', 'patient']), updatePatient);
router.delete("/emergency-contacts/:patientId/:contactId", verifyTokenWithRole(['admin', 'patient']), deleteEmergencyContact);
router.delete("/delete/:patientId", verifyTokenWithRole(['admin', 'patient']), deletePatient);


export default router;