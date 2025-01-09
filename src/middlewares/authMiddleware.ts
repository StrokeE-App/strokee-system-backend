import { Request, Response, NextFunction } from "express";
import Patient from "../models/usersModels/patientModel";
import { firebaseAdmin } from "../config/firebase-cofig";

export const verifyTokenWithRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.cookies.session_token;

        if (!token) {
            res.status(401).json({ message: "Token no proporcionado." });
            return;
        }

        try {
            const decodedToken = await firebaseAdmin.verifySessionCookie(token, true);
            const { email } = decodedToken;

            const user = await Patient.findOne({ email });
            if (!user) {
                res.status(404).json({ message: "Usuario no encontrado." });
                return;
            }

            const userRole = decodedToken.role 

            if (!allowedRoles.includes(userRole)) {
                res.status(403).json({ message: "Acceso denegado. No tienes permisos para esta acción." });
                return;
            }

            (req as any).user = user;
            next();
        } catch (error) {
            console.error("Error en la verificación del token o rol:", error);
            res.status(403).json({ message: "Token inválido o expirado.", error });
        }
    };
};