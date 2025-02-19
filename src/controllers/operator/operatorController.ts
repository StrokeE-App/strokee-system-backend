import { NextFunction, Request, Response } from "express";
import { 
    addOperatorIntoCollection, 
    cancelEmergencyCollectionOperator, 
    updateEmergencyPickUpFromCollectionOperator,
    updateOperatorFromCollection,
    getOperatorFromCollection,
    deleteOperatorFromCollection
 } from "../../services/operators/operatorService";

export const registerOperator = async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const result = await addOperatorIntoCollection(firstName, lastName, email, password);

        if (result.success) {
            res.status(201).json({
                message: result.message,
                operatorId: result.operatorId,
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

export const confirmEmergencyOperator = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { emergencyId, ambulanceId } = req.body;

        if (!emergencyId || !ambulanceId) {
            res.status(400).json({
                message: "Por favor, ingresar un emergencyId y un ambulanceId válido.",
            });
            return;
        }

        const result = await updateEmergencyPickUpFromCollectionOperator(emergencyId, ambulanceId);

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
};


export const cancelEmergencyOperator = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { emergencyId } = req.body

        if (!emergencyId) {
            res.status(400).json({
                message: "Por favor, ingresar un emergencyid",
            });
        }

        const result = await cancelEmergencyCollectionOperator(emergencyId);

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

export const updateOperator = async (req: Request, res: Response, next: NextFunction) => {
    const { operatorId } = req.params;
    const operatorData = req.body;
    try {
        const result = await updateOperatorFromCollection(operatorId, operatorData);
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

export const getOperator = async (req: Request, res: Response, next: NextFunction) => {
    const  operatorId  = req.params.operatorId;
    try {
        const result = await getOperatorFromCollection(operatorId);
        if (result.success) {
            res.status(200).json({
                message: result.message,
                operator: result.operator,
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

export const deleteOperator = async (req: Request, res: Response, next: NextFunction) => {
    const  { operatorId }  = req.params;
    try {
        const result = await deleteOperatorFromCollection(operatorId);
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