import { Request, Response, NextFunction } from "express";
import { firebaseAdmin } from "../config/firebase-config";
import User from "../models/usersModels/rolesModel"; 

export const verifyTokenWithRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Token no proporcionado o inválido." });
            return;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decodedToken = await firebaseAdmin.verifyIdToken(token);
            const { email, user_id: userId, auth_time } = decodedToken;

            const userRecord = await firebaseAdmin.getUser(userId);
            const revokeTime = userRecord.tokensValidAfterTime 
            ? new Date(userRecord.tokensValidAfterTime).getTime() / 1000 
            : 0;
            
            if (auth_time < revokeTime) {
                res.status(401).json({ message: "Token inválido. Por favor, inicia sesión nuevamente." });
                return;
            }

            const user = await User.findOne({ userId: userId });

            if (!user) {
                res.status(404).json({ message: "Usuario no encontrado." });
                return;
            }

            if(user.isActive === false) {
                res.status(403).json({ message: "Acceso denegado. El usuario se encuentra inactivo." });
                return;
            }

            if (!allowedRoles.includes(user.role)) {
                res.status(403).json({ message: "Acceso denegado. No tienes permisos para esta acción." });
                return;
            }

            (req as any).userId = { userId, email, role: user.role };

            next();
        } catch (error) {
            console.error("Error en la verificación del token:", error);
            res.status(403).json({ message: "Token inválido o expirado.", error });
        }
    };
};
