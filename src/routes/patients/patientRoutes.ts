import { Router } from "express";
import { getAllPatients, registerPatient, getToken, refreshToken, logoutPatient, loginPatient } from "../../controllers/patients/patientController";
import { verifyToken } from "../../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyToken, getAllPatients);
router.post("/register", registerPatient);
router.post("/refresh-token", refreshToken);
router.post("/authenticate", getToken);
router.post("/login", loginPatient );
router.post("/logout", logoutPatient);


export default router;