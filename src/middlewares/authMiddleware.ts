import { Request, Response, NextFunction } from "express";
import Patient from "../models/usersModels/patientModel";
import { authSDK } from "../config/firebase-cofig";


export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Token no proporcionado." });
        return
    }

    try {
        const decodedToken = await authSDK.verifyIdToken(token);
        const { email } = decodedToken;

        const user = await Patient.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado en la base de datos." });
            return
        }

        (req as any).user = user;
        next();
    } catch (error) {
        res.status(403).json({ message: "Token inválido o expirado.", error });
        return
    }
};