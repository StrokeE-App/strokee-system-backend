import { Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { addAdmin } from "../controllers/admins/adminController";

const router = Router()

router.post("/register", addAdmin);

export default router;
