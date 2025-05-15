import { NextFunction, Request, Response } from "express";
import { registerToken, unregisterToken } from "../services/pushNotifications";

export const registerTokenController = async (req: Request, res: Response, next: NextFunction) => {
    const { role, userId, token, device } = req.body;
    try {
        const result = await registerToken(role, userId, token, device);
        if (result.success) {
            res.status(200).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const unregisterTokenController = async (req: Request, res: Response, next: NextFunction) => {
    const { role, userId, token } = req.body;
    try {
        const result = await unregisterToken(role, userId, token);
        if (result.success) {
            res.status(200).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
};
 