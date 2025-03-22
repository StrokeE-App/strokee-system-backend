import { Request, Response, Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { loginUser, logoutUser, getToken } from "../controllers/auth/authController";

const router = Router()

router.get("/api/", (req: Request, res: Response) => {
    res.send("Server running...")
});

router.post("/api/login", loginUser);
router.post("/api/logout", verifyTokenWithRole(["admin", "paramedic", "operator", "patient", "clinic"]), logoutUser);
router.post("/api/token", getToken);

export default router;
