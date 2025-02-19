import { Router } from "express";
import { registerOperator, cancelEmergencyOperator, confirmEmergencyOperator, updateOperator, getOperator, deleteOperator } from "../controllers/operator/operatorController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerOperator);
router.post("/assign-ambulance", verifyTokenWithRole(["operator"]), confirmEmergencyOperator);
router.post("/cancel-emergency", verifyTokenWithRole(["operator"]), cancelEmergencyOperator);
router.put("/update/:operatorId", verifyTokenWithRole(["admin", "operator"]), updateOperator);
router.get("/:operatorId", verifyTokenWithRole(["admin", "operator"]), getOperator);
router.delete("/delete/:operatorId", verifyTokenWithRole(["admin", "operator"]), deleteOperator);


export default router;