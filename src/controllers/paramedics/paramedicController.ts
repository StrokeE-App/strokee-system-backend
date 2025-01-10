import { NextFunction, Request, Response } from "express";
import { addParamedicIntoCollection } from "../../services/paramedics/paramedicService";

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