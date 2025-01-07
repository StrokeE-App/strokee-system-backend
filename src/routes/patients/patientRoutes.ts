import { Router } from "express";
import { getAllPatients, registerPatient, loginUser, refreshToken, logoutPatient } from "../../controllers/patients/patientController";
import { verifyToken } from "../../middlewares/authMiddleware"
const router = Router()

router.get("/all", verifyToken, getAllPatients);
router.post("/register", registerPatient);
router.post("/refresh-token", refreshToken);
router.post("/authenticate", loginUser);
router.post("/logout", logoutPatient);


export default router;