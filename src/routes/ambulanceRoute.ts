import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addAmbulanceController, deleteAmbulanceController, editAmbulanceController, getAmbulanceController } from "../controllers/operator/ambulanceController";

const router = Router()

router.post("/register", verifyTokenWithRole(["admin"]), addAmbulanceController);
router.get("/:ambulanceId", verifyTokenWithRole(["admin", "operator"]), getAmbulanceController);
router.put("/update/:ambulanceId", verifyTokenWithRole(["admin"]), editAmbulanceController);
router.delete("/delete/:ambulanceId", verifyTokenWithRole(["admin"]), deleteAmbulanceController);

export default router