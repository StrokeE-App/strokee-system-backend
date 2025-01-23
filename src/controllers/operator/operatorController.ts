import { NextFunction, Request, Response } from "express";
import { addOperatorIntoCollection } from "../../services/operators/operatorService";

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