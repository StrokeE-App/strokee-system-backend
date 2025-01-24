import { Router } from "express";
import { registerOperator, cancelEmergencyOperator, confirmEmergencyOperator } from "../controllers/operator/operatorController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerOperator);
router.post("/assign-ambulance", verifyTokenWithRole(["operator"]), confirmEmergencyOperator);
router.post("/cancel-emergency", verifyTokenWithRole(["operator"]), cancelEmergencyOperator);


export default router;