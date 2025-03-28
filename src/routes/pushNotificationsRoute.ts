import { Router } from "express";
import { registerTokenController, unregisterTokenController } from "../controllers/notificationController";

const router = Router()

router.post("/subscribe-notification", registerTokenController);
router.post("/unsubscribe-notification", unregisterTokenController);

export default router