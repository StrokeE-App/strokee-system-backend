import { NextFunction, Request, Response } from "express";
import { addHealthCenterIntoCollection, deleteHealthCenterStaff, getHealthCenterStaff, updateHealthCenterStaff, getPatientDeliverdToHealthCenter, sendEmailToRegisterPatient } from "../../services/healthCenterStaff/healthCenterService";

export const addHealthCenter = async (req: Request, res: Response, next: NextFunction) => {
    const healthCenterData = req.body;
    try {
        const result = await addHealthCenterIntoCollection(healthCenterData);
        if (result.success) {
            res.status(201).json({
                message: result.message,
                healthCenterId: result.healthCenterId,
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

export const getHealthCenter = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.medicId;
    try {
        const result = await getHealthCenterStaff(userId);
        if (result.success) {
            res.status(200).json({
                message: result.message,
                healthCenterStaff: result.healthCenterStaff,
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

export const updateHealthCenter = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.medicId;
    const healthCenterData = req.body;
    try {
        const result = await updateHealthCenterStaff(userId, healthCenterData);
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

export const deleteHealthCenter = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.medicId;
    try {
        const result = await deleteHealthCenterStaff(userId);
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

export const deliverPatient = async (req: Request, res: Response, next: NextFunction) => {
    const { emergencyId } = req.body;

    try {
        const result = await getPatientDeliverdToHealthCenter(emergencyId);

        res.status(result.code).json({ message: result.message });

    } catch (error) {
        next(error);
    }
};

export const invitePatient = async (req: Request, res: Response, next: NextFunction) => {
    const { email, medicId } = req.body;
    try {
        const result = await sendEmailToRegisterPatient(email, medicId);
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}