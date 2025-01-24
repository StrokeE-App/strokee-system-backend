import { Router } from "express";
import { registerOperator, cancelEmergencyOperator, confirmEmergencyOperator } from "../controllers/operator/operatorController";

const router = Router();

router.post("/register", registerOperator);
router.post("/assign-ambulance", confirmEmergencyOperator);
router.post("/cancel-emergency", cancelEmergencyOperator);


export default router;