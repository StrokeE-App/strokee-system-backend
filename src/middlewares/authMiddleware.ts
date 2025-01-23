import { Request, Response, NextFunction } from "express";
import { firebaseAdmin } from "../config/firebase-config";
import User from "../models/usersModels/rolesModel"; 

export const verifyTokenWithRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.cookies.session_token;

        if (!token) {
            res.status(401).json({ message: "Token no proporcionado." });
            return;
        }

        try {
            const decodedToken = await firebaseAdmin.verifySessionCookie(token, true);
            const { email, user_id: userId } = decodedToken;

            const user = await User.findOne({ userId: userId, isDeleted: false });

            if (!user) {
                res.status(404).json({ message: "Usuario no encontrado." });
                return;
            }

            if (!allowedRoles.includes(user.role)) {
                res.status(403).json({ message: "Acceso denegado. No tienes permisos para esta acción." });
                return;
            }

            (req as any).userId = { userId, email, role: user.role };

            next();
        } catch (error) {
            console.error("Error en la verificación del token o rol:", error);
            res.status(403).json({ message: "Token inválido o expirado.", error });
        }
    };
};
