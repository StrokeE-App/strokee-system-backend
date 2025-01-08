import { Router } from "express";
import { getAllPatients, registerPatient } from "../../controllers/patients/patientController";
import { verifyToken } from "../../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyToken, getAllPatients);
router.post("/register", registerPatient);


export default router;