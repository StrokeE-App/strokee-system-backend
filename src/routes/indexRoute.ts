import { Request, Response, Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { loginUser, logoutUser, getToken } from "../controllers/auth/authController";

const router = Router()

router.get("/strokeebackend/api/", (req: Request, res: Response) => {
    res.send("Server running...")
});

router.post("/strokeebackend/api/login", loginUser);
router.post("/strokeebackend/api/logout", verifyTokenWithRole(["admin", "paramedic", "operator", "patient", "clinic"]), logoutUser);
router.post("/strokeebackend/api/token", getToken);

export default router;
