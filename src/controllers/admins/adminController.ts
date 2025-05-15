import { NextFunction, Request, Response } from "express";
import { registerAdminIntoCollection, deleteAdmin, getAdmin, updateAdmin, getAllUsers, activateUser, inactivateUser } from "../../services/admins/adminService";

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

export const deleteAdminById = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.adminId;
    try {
        const result = await deleteAdmin(adminId);
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
}

export const getAdminById = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.adminId;
    try {
        const result = await getAdmin(adminId);
        if (result.success) {
            res.status(200).json({
                message: result.message,
                admin: result.admin,
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

export const updateAdminById = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.adminId;
    const adminData = req.body;
    try {
        const result = await updateAdmin(adminId, adminData);
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
}

export const getAllAppUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await getAllUsers();
        if (result.success) {
            res.status(200).json({
                message: result.message,
                users: result.users
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

export const activateUserController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    try {
        const result = await activateUser(userId);
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
}

export const inactivateUserController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    try {
        const result = await inactivateUser(userId);
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
}