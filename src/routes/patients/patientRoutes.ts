import { Router } from "express";
import { getAllPatients, registerPatient } from "../../controllers/patients/patientController";
import { registerEmergencyContacts } from "../../controllers/patients/emergencyContactsController";
import { verifyToken } from "../../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyToken, getAllPatients);
router.post("/register", registerPatient);
router.post("/emergency-contacts/register", registerEmergencyContacts);


export default router;