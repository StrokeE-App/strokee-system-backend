import { NextFunction, Request, Response } from "express";
import { 
    addParamedicIntoCollection, 
    getAllActiveEmergenciesFromCollection, 
    updateEmergencyPickUpFromCollection,
    cancelEmergencyCollection
} from "../../services/paramedics/paramedicService";

export const registerParamedic = async (req: Request, res: Response, next: NextFunction) => {
    const { ambulanceId, firstName, lastName, email, password } = req.body;

    try {
        const result = await addParamedicIntoCollection(ambulanceId, firstName, lastName, email, password);

        if (result.success) {
            res.status(201).json({
                message: result.message,
                ambulanceId: result.ambulanceId,
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

export const getActiveEmergencies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId.userId;

        const result = await getAllActiveEmergenciesFromCollection(userId);

        if (result.success) {
            if (!result.data) {
                res.status(404).json({
                    message: "No se encontraron emergencias activas",
                });
                return;
            }
            res.status(200).json({
                message: result.message,
                data: result.data,
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

export const confirmEmergency = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { emergencyId, pickupDate } = req.body

        if (!emergencyId || !pickupDate) {
            res.status(400).json({
                message: "Por favor, ingresar un emergencyid y un pickdate valido",
            });
        }

        const result = await updateEmergencyPickUpFromCollection(emergencyId, pickupDate);

        if (result.success) {
            if (!result) {
                res.status(404).json({
                    message: "No se encontraron emergencias con ese Id",
                });
                return;
            }
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

export const cancelEmergency = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { emergencyId, pickupDate } = req.body

        if (!emergencyId || !pickupDate) {
            res.status(400).json({
                message: "Por favor, ingresar un emergencyid y un pickdate valido",
            });
        }

        const result = await cancelEmergencyCollection(emergencyId, pickupDate);

        if (result.success) {
            if (!result) {
                res.status(404).json({
                    message: "No se encontraron emergencias con ese Id",
                });
                return;
            }
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