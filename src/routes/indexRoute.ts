import { Request, Response, Router } from "express";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";
import { loginUser, logoutUser, getToken } from "../controllers/auth/authController";

const router = Router()

router.get("/", (req: Request, res: Response) => {
    res.send("Server running...")
});

router.post("/login", loginUser);
router.post("/logout", verifyTokenWithRole(["admin", "paramedic", "operator", "patient", "clinic"]), logoutUser);
router.post("/token", getToken);

export default router;
