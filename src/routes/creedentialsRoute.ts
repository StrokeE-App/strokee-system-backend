import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { updateEmailController, updatePasswordController } from "../controllers/auth/authController";

const router = Router()

router.put("/update-email/:userId", verifyTokenWithRole(["admin", "paramedic", "operator", "patient", "clinic"]), updateEmailController);
router.put("/update-password/:userId", verifyTokenWithRole(["admin", "paramedic", "operator", "patient", "clinic"]), updatePasswordController);

export default router;
