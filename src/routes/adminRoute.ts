import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addAdmin, deleteAdminById, getAdminById, updateAdminById, getAllAppUsers, activateUserController, inactivateUserController } from "../controllers/admins/adminController";

const router = Router()

router.post("/register", addAdmin);
router.post("/activate-user", verifyTokenWithRole(["admin"]), activateUserController);
router.post("/inactivate-user", verifyTokenWithRole(["admin"]), inactivateUserController);
router.get("/all", verifyTokenWithRole(["admin"]), getAllAppUsers);
router.get("/:adminId", verifyTokenWithRole(["admin"]), getAdminById);
router.put("/update/:adminId", verifyTokenWithRole(["admin"]), updateAdminById);
router.delete("/delete/:adminId", verifyTokenWithRole(["admin"]), deleteAdminById);

export default router;
