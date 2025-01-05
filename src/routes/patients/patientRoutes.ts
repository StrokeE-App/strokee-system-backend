import { Router } from "express";
import { getAllPatients, registerPatient, loginUser } from "../../controllers/patients/patientController";
import { verifyToken } from "../../middlewares/authMiddleware"
const router = Router()

router.get("/patients", verifyToken, getAllPatients);
router.post("/register", registerPatient);
router.post("/login", loginUser);


export default router;