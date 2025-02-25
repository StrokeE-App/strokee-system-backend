import { NextFunction, Request, Response } from "express";
import { addHealthCenterIntoCollection } from "../../services/healthCenterStaff/healthCenterService";

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