import { Router } from "express";
import { registerParamedic } from "../../controllers/paramedics/paramedicController";
import { verifyTokenWithRole } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerParamedic);

export default router;