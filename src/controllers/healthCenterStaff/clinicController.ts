import { NextFunction, Request, Response } from "express";
import { addHealthcenter, deleteHealthcenter, getHealthcenter, getHealthcenters, updateHealthcenter } from "../../services/healthCenterStaff/clinicService";

export const addClinicController = async (req: Request, res: Response, next: NextFunction) => {
    const { healthCenterName } = req.body;
    try {
        const result = await addHealthcenter(healthCenterName);
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}

export const getClinicsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getHealthcenters();
        if (result.success) {
            if ( result.Healthcenters && result.Healthcenters.length === 0) {
                res.status(200).json({ message: result.message, clinics: [] });
            }
            res.status(200).json({ message: result.message, clinics: result.Healthcenters });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}

export const getClinicController = async (req: Request, res: Response, next: NextFunction) => {
    const { healthcenterId } = req.params;
    try {
        const result = await getHealthcenter(healthcenterId);
        if (result.success) {
            if (!result.Healthcenter) {
                res.status(404).json({ message: result.message, clinic: {} });
            }
            res.status(200).json({ message: result.message, clinic: result.Healthcenter });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}

export const updateClinicController = async (req: Request, res: Response, next: NextFunction) => {
    const { healthcenterId } = req.params;

    try {
        const result = await updateHealthcenter(healthcenterId, req.body);
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}

export const deleteClinicController = async (req: Request, res: Response, next: NextFunction) => {
    const { healthcenterId } = req.params;
    try {
        const result = await deleteHealthcenter(healthcenterId);
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}

