import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addAdmin, deleteAdminById, getAdminById, updateAdminById } from "../controllers/admins/adminController";

const router = Router()

router.post("/register", addAdmin);
router.get("/:adminId", verifyTokenWithRole(["admin"]), getAdminById);
router.put("/update/:adminId", verifyTokenWithRole(["admin"]), updateAdminById);
router.delete("/delete/:adminId", verifyTokenWithRole(["admin"]), deleteAdminById);

export default router;
