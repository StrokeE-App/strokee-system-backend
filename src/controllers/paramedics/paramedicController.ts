import { NextFunction, Request, Response } from "express";
import { 
    addParamedicIntoCollection, 
    updateEmergencyPickUpFromCollection,
    cancelEmergencyCollection,
    updateParamedicFromCollection,
    getParamedicsFromCollection,
    deleteParamedicsFromCollection,
    getPatientDeliverdToHealthCenter
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

export const confirmEmergency = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { emergencyId, pickupDate, healthcenterId } = req.body

        if (!emergencyId || !pickupDate || !healthcenterId) {
            res.status(400).json({
                message: "Por favor, ingresar un emergencyid, un pickdate y un clinicid valido",
            });
            return;
        }

        const result = await updateEmergencyPickUpFromCollection(emergencyId, pickupDate, healthcenterId);

        if (!result.success) {
            if (result.message.includes("No se encontró una emergencia")) {
                res.status(404).json({ message: result.message });
            } else {
                res.status(400).json({ message: result.message });
            }
            return;
        }

        res.status(200).json({
            message: result.message,
        });
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

        if (!result.success) {
            if (result.message.includes("No se encontró una emergencia")) {
                res.status(404).json({ message: result.message });
            } else {
                res.status(400).json({ message: result.message });
            }
            return;
        }

        res.status(200).json({
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

export const updateParamedic = async (req: Request, res: Response, next: NextFunction) => {
    const { paramedicId } = req.params;
    const paramedicData = req.body;
    try {
        const result = await updateParamedicFromCollection(paramedicId, paramedicData);
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

export const getParamedic = async (req: Request, res: Response, next: NextFunction) => {
    const { paramedicId } = req.params;
    try {
        const result = await getParamedicsFromCollection(paramedicId);
        if (result.success) {
            res.status(200).json({
                message: result.message,
                data: result.paramedics
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

export const deleteParamedic = async (req: Request, res: Response, next: NextFunction) => {
    const { paramedicId } = req.params;
    try {
        const result = await deleteParamedicsFromCollection(paramedicId);
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
    const { emergencyId, deliveredDate } = req.body;

    try {
        const result = await getPatientDeliverdToHealthCenter(emergencyId, deliveredDate);

        res.status(result.code).json({ message: result.message });

    } catch (error) {
        next(error);
    }
};