import { NextFunction, Request, Response } from "express";
import { registerAdminIntoCollection } from "../../services/admins/adminService";

export const addAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const adminData = req.body;
    try {
        const result = await registerAdminIntoCollection(adminData);
        if (result.success) {
            res.status(201).json({
                message: result.message,
                adminId: result.adminId,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
}