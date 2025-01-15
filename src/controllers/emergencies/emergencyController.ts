import { NextFunction, Request, Response } from "express";
import { getEmergencyFromCollection } from "../../services/emergencies/emeregencyService";

export const getEmergency = async(req: Request, res: Response, next: NextFunction) => {
    const { emergencyId } = req.params;

    try {
        const result = await getEmergencyFromCollection(emergencyId);

        if (result.success) {
            if (!result.data) {
                res.status(404).json({
                    message: "No se encontró la emergencia con el id proporcionado.",
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
