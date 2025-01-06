import { Router } from "express";
import { getAllPatients, registerPatient, loginUser, refreshToken } from "../../controllers/patients/patientController";
import { verifyToken } from "../../middlewares/authMiddleware"
const router = Router()

router.get("/patients", verifyToken, getAllPatients);
router.post("/register", registerPatient);
router.post("/refresh-token", refreshToken);
router.post("/authenticate", loginUser);


export default router;